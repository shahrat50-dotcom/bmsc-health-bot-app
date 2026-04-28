import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, Droplets, Thermometer, Sparkles, PhoneCall, LogOut, Globe } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { format } from 'date-fns'
import { Card } from '@/src/components/ui/Card'
import { getGemini } from '@/src/lib/gemini'
import { supabase } from '@/src/lib/supabase'
import { getCache, setCache, removeCache } from '@/src/lib/cache'
import { useLanguage } from '@/src/contexts/LanguageContext'

const generateInitialChartData = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    time: format(new Date().setHours(i * 2, 0, 0, 0), 'h:mm a'),
    hr: 60 + Math.random() * 40,
    spo2: 95 + Math.random() * 5,
  }))
}

export function Dashboard() {
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    spo2: 98,
    temp: 98.6,
    balance: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [aiInsight, setAiInsight] = useState<{status: string, recommendation: string, extra_steps: string[]} | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  
  // BMI and BMR Calculator State
  const [height, setHeight] = useState('170')
  const [weight, setWeight] = useState('70')
  const [age, setAge] = useState('25')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [bmi, setBmi] = useState<number | null>(null)
  const [bmr, setBmr] = useState<number | null>(null)
  
  const [bmiAiInsight, setBmiAiInsight] = useState<{status: string, advice: string, daily_calories: number, weight_adjustment: string} | null>(null)
  const [bmiAiLoading, setBmiAiLoading] = useState(false)
  const [bmiAiError, setBmiAiError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchProfile(user.id)
        fetchHistory(user.id)
      } else {
        navigate('/')
      }
    }
    
    const fetchProfile = async (userId: string) => {
      if (!supabase) return;
      
      const cachedProfile = await getCache(`profile_${userId}`);
      if (cachedProfile) {
        setHealthData(cachedProfile as any);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        
      if (data) {
        const newHealthData = {
          heartRate: data.heart_rate || 72,
          spo2: data.spo2 || 98,
          temp: data.temp || 98.6,
          balance: data.balance || 0
        };
        setHealthData(newHealthData);
        await setCache(`profile_${userId}`, newHealthData);
      }
    }

    const fetchHistory = async (userId: string) => {
      if (!supabase) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const cachedHistory = await getCache(`history_${userId}`);
      if (cachedHistory) {
         setChartData(cachedHistory as any);
      }

      const { data, error } = await supabase
        .from('vitals_history')
        .select('created_at, heart_rate, spo2')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      if (data && data.length > 0) {
        const sortedData = [...data].reverse()
        const mappedData = sortedData.map(item => ({
          time: format(new Date(item.created_at), 'h:mm a'),
          hr: item.heart_rate,
          spo2: item.spo2
        }))
        setChartData(mappedData)
        await setCache(`history_${userId}`, mappedData)
      } else if (!cachedHistory) {
        // Fallback to some dummy data if no history yet
        setChartData(generateInitialChartData())
      }
    }

    checkUser()
    
    const { data: authListener } = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/')
      } else if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    }) || { data: { subscription: null } };
      
    // Realtime subscription
    let channel: any = null;
    if (supabase && user?.id) {
      const channelName = `realtime:public:profiles:${user.id}`;
      
      // Setup the channel
      channel = supabase
        .channel(channelName)
        .on('broadcast', { event: 'vitals_update' }, (payload) => {
          setHealthData(prev => ({
            ...prev,
            heartRate: payload.payload.heartRate,
            spo2: payload.payload.spo2,
            temp: payload.payload.temp,
            balance: payload.payload.balance
          }))
        })
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${user.id}`
          }, 
          (payload) => {
            if (payload.new) {
              setHealthData({
                heartRate: payload.new.heart_rate,
                spo2: payload.new.spo2,
                temp: payload.new.temp,
                balance: payload.new.balance
              })
            }
          }
        )
        .subscribe();
    }

    return () => {
      authListener?.subscription?.unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
    }
  }, [navigate, user?.id])

  useEffect(() => {
    setChartData(prev => {
      if (prev.length === 0) return prev;
      const lastPoint = prev[prev.length - 1];
      
      if (lastPoint && lastPoint.hr === healthData.heartRate && lastPoint.spo2 === healthData.spo2) {
        return prev;
      }

      const d = new Date();
      const timeStr = format(d, 'h:mm:ss a');
      
      const newPoint = { time: timeStr, hr: healthData.heartRate, spo2: healthData.spo2 };
      const nextData = [...prev, newPoint];
      return nextData.length > 20 ? nextData.slice(nextData.length - 20) : nextData;
    });
  }, [healthData.heartRate, healthData.spo2])

  useEffect(() => {
    fetchInsightData();
  }, [user?.id, language])

  const fetchInsightData = async () => {
    if (!user) return;
    
    try {
      setAiLoading(true)
      setAiError(null)
      const ai = getGemini()
      const langPrompt = language === 'bn' ? "Respond entirely in Bengali language." : "Respond in English.";
      const prompt = `Given these vitals: Heart Rate ${Math.round(healthData.heartRate)} bpm, SpO2 ${Math.round(healthData.spo2)}%, Temp ${healthData.temp.toFixed(1)}°F.` +
      ` ${langPrompt} Provide a response in JSON format exactly matching this schema:
{
  "status": "string (e.g. Normal, Elevated Heart Rate, etc.)",
  "recommendation": "string (1 personalized 1-sentence advice)",
  "extra_steps": ["string", "string"]
}`
      const result = await ai.models.generateContent({
         model: 'gemini-3-flash-preview',
         contents: prompt,
         config: { responseMimeType: "application/json" }
      });
      const responseText = result.text;
      const data = JSON.parse(responseText);
      setAiInsight(data)
    } catch (e: any) {
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
        setAiError("Please try again after 15 minutes. Note: Add VITE_GEMINI_API_KEY in Vercel to use AI.")
      } else {
        setAiError("Could not analyze vitals. " + (e?.message || ''))
      }
    } finally {
      setAiLoading(false)
    }
  }

  const refreshAction = () => {
    fetchInsightData();
  }
  
  const handleCalculateBmiBmr = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (!h || !w || !a) return;

    const calculatedBmi = w / ((h / 100) * (h / 100));
    setBmi(calculatedBmi);

    let calculatedBmr = 0;
    if (gender === 'male') {
        calculatedBmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
        calculatedBmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    setBmr(calculatedBmr);

    try {
        setBmiAiLoading(true);
        setBmiAiError(null);
        const ai = getGemini();
        const langPrompt = language === 'bn' ? "Respond entirely in Bengali language." : "Respond in English.";
        const prompt = `Given these measurements: Height ${h}cm, Weight ${w}kg, Age ${a}, Gender ${gender}. BMI is ${calculatedBmi.toFixed(1)} and BMR is ${Math.round(calculatedBmr)} kcal/day.
${langPrompt} Provide a response in JSON format exactly matching this schema:
{
  "status": "string (e.g. Underweight, Normal, Overweight, Obese)",
  "weight_adjustment": "string (Advice on whether to lose weight, gain weight, or maintain it)",
  "daily_calories": number (Suggested daily calorie intake to achieve this goal),
  "advice": "string (1-2 sentences of specific actionable advice to stay healthy)"
}`;
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const responseText = result.text;
        const data = JSON.parse(responseText);
        setBmiAiInsight(data);
    } catch (e: any) {
        if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
          setBmiAiError("Please try again after 15 minutes. Note: Add VITE_GEMINI_API_KEY in Vercel to use AI.")
        } else {
          setBmiAiError("Could not analyze BMI data. " + (e?.message || ''))
        }
    } finally {
        setBmiAiLoading(false);
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      if (user?.id) {
        await removeCache(`profile_${user.id}`);
        await removeCache(`history_${user.id}`);
      }
      await supabase.auth.signOut()
    }
    navigate('/')
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <header className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0369A1]">Smart Health <span className="font-light text-[#38BDF8]">Assist</span></h1>
          <p className="text-slate-500 text-sm font-medium">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} 
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-sky-600 transition-colors flex items-center justify-center font-bold text-xs w-9 h-9"
            title="Toggle Language"
          >
            {language === 'en' ? 'BN' : 'EN'}
          </button>
          <button onClick={handleLogout} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700">
            <LogOut className="w-5 h-5"/>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
            {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      <Card 
        className="p-4 bg-rose-50 border-rose-200 shadow-sm cursor-pointer hover:bg-rose-100 transition-colors flex items-center justify-between"
        onClick={() => navigate('/app/emergency')}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-md shadow-rose-500/30">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-rose-950">{t('emergencyContacts')}</h3>
            <p className="text-[10px] uppercase font-bold text-rose-500 mt-1">{t('hospitalsAndAmbulances')}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-rose-200 flex items-center justify-center text-rose-400 bg-white">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </Card>

      <Card className="p-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-bold text-slate-800">{t('realTimeVitals')}</h2>
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">Live Data</span>
             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">৳{healthData.balance.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-around items-center">
          <CircularProgress 
            value={Math.round(healthData.heartRate)} 
            label={t('heartRate')} 
            unit="BPM" 
            color="#F43F5E" 
            max={150} 
            status="NORMAL" 
            statusColor="text-green-500" 
          />
          <CircularProgress 
            value={Math.round(healthData.spo2)} 
            label={t('oxygenLevel')} 
            unit="SpO2%" 
            color="#0EA5E9" 
            max={100} 
            status="OPTIMAL" 
            statusColor="text-green-500" 
          />
        </div>
        <div className="mt-6 flex justify-center">
          <CircularProgress 
            value={healthData.temp.toFixed(1)} 
            label={t('bodyTemperature')} 
            unit="°F" 
            color="#F59E0B" 
            max={110} 
            status="NORMAL" 
            statusColor="text-amber-500" 
          />
        </div>
      </Card>

      <Card className="overflow-hidden border border-sky-100 shadow-xl shadow-sky-900/5">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="font-bold text-slate-800">{t('healthStatusInsight')}</h3>
            </div>
            <button 
              onClick={refreshAction}
              disabled={aiLoading}
              className={`text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full transition-colors ${aiLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-100'}`}
            >
              {aiLoading ? t('analyzing') : t('updateAi')}
            </button>
          </div>
          
          {aiLoading ? (
             <div className="animate-pulse space-y-3">
               <div className="h-4 bg-slate-100 rounded w-3/4"></div>
               <div className="h-4 bg-slate-100 rounded w-1/2"></div>
             </div>
          ) : aiError ? (
             <p className="text-sm font-medium text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">
               {aiError}
             </p>
          ) : aiInsight ? (
            <div className="space-y-4">
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('status')}</span>
                  <p className="text-sm font-bold text-slate-800">{aiInsight.status}</p>
               </div>
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('recommendation')}</span>
                  <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-amber-200 pl-3 py-0.5 mt-1">"{aiInsight.recommendation}"</p>
               </div>
               {aiInsight.extra_steps && aiInsight.extra_steps.length > 0 && (
                 <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('extraStepsForGoodHealth')}</span>
                    <ul className="mt-2 space-y-2">
                       {aiInsight.extra_steps.map((step, idx) => (
                         <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                           <span className="text-sky-500 mt-0.5">•</span>
                           <span>{step}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
               )}
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="p-6 overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5">
        <h3 className="font-bold text-slate-800 text-lg mb-4">{t('bmiBmrCalculator')}</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">{t('heightCm')}</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">{t('weightKg')}</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">{t('age')}</label>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">{t('gender')}</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>
        </div>
        <div className="flex justify-start mb-6">
          <button 
            onClick={handleCalculateBmiBmr}
            disabled={bmiAiLoading}
            className={`text-sm font-bold text-white bg-slate-800 px-6 py-2.5 rounded-xl transition-colors ${bmiAiLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-900 shadow-md shadow-slate-900/10'}`}
          >
            {bmiAiLoading ? t('calculating') : t('calculateAndGetAiAdvice')}
          </button>
        </div>

        {bmi !== null && bmr !== null && !bmiAiLoading && !bmiAiError && (
          <div className="flex gap-6 mb-6">
            <div className="flex-1 bg-sky-50 rounded-xl p-4 border border-sky-100 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-1">{t('yourBmi')}</p>
              <p className="text-3xl font-black text-sky-950">{bmi.toFixed(1)}</p>
            </div>
            <div className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{t('yourBmr')}</p>
              <p className="text-3xl font-black text-emerald-950">{Math.round(bmr)} <span className="text-xs font-bold text-emerald-700">kcal/day</span></p>
            </div>
          </div>
        )}

        {bmiAiLoading ? (
           <div className="animate-pulse space-y-3 mt-4">
             <div className="h-4 bg-slate-100 rounded w-3/4"></div>
             <div className="h-4 bg-slate-100 rounded w-1/2"></div>
           </div>
        ) : bmiAiError ? (
           <p className="text-sm font-medium text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 mt-4">
             {bmiAiError}
           </p>
        ) : bmiAiInsight ? (
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('weightStatus')}</span>
                <p className="text-sm font-bold text-slate-800">{bmiAiInsight.status}</p>
             </div>
             <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('adjustmentNeeded')}</span>
                <p className="text-sm font-bold text-slate-800">{bmiAiInsight.weight_adjustment}</p>
             </div>
             <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('recommendedDailyCalories')}</span>
                <p className="text-sm font-bold text-amber-600 flex items-center gap-1">
                  <span className="text-xl">☀️</span> {bmiAiInsight.daily_calories} kcal/day
                </p>
             </div>
             <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('aiAdvice')}</span>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3 py-0.5 mt-1">"{bmiAiInsight.advice}"</p>
             </div>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 px-1 text-lg">{t('heartRateTrend')}</h3>
        <Card className="h-64 p-4 flex flex-col pt-6 bg-white overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', padding: '8px' }}
                itemStyle={{ fontWeight: 600, padding: '2px 0' }}
              />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval="preserveStartEnd"
              />
              <Area 
                type="monotone" 
                dataKey="hr" 
                name="Heart Rate"
                stroke="#f43f5e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHr)" 
              />
              <Area 
                type="monotone" 
                dataKey="spo2" 
                name="Oxygen"
                stroke="#0ea5e9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpo2)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="h-6"></div>
    </div>
  )
}

function CircularProgress({ value, label, unit, color, max, status, statusColor }: any) {
  const percentage = Math.min(100, Math.max(0, (Number(value) / max) * 100))
  const offset = 251 - (251 * percentage) / 100

  return (
    <div className="text-center flex flex-col items-center">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke={color} strokeWidth="8" strokeDasharray="251" strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="text-center">
          <p className="text-3xl font-black text-slate-800">{value}</p>
          <p className="text-[10px] uppercase font-bold text-slate-400">{unit}</p>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-slate-600">{label}</p>
      <p className={`text-[10px] uppercase font-bold mt-0.5 ${statusColor}`}>{status}</p>
    </div>
  )
}


