import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, Droplets, Thermometer, Sparkles, PhoneCall, LogOut } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { format } from 'date-fns'
import { Card } from '@/src/components/ui/Card'
import { getGemini } from '@/src/lib/gemini'
import { supabase } from '@/src/lib/supabase'

const generateInitialChartData = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    time: `${i * 2}:00`,
    hr: 60 + Math.random() * 40,
    spo2: 95 + Math.random() * 5,
  }))
}

export function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    spo2: 98,
    temp: 98.6,
    balance: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [aiInsight, setAiInsight] = useState("Analyzing your vitals...")

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        
      if (data) {
        setHealthData({
          heartRate: data.heart_rate || 72,
          spo2: data.spo2 || 98,
          temp: data.temp || 98.6,
          balance: data.balance || 0
        })
      }
    }

    const fetchHistory = async (userId: string) => {
      if (!supabase) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('vitals_history')
        .select('created_at, heart_rate, spo2')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: true })
        .limit(100)

      if (data && data.length > 0) {
        const mappedData = data.map(item => ({
          time: format(new Date(item.created_at), 'HH:mm'),
          hr: item.heart_rate,
          spo2: item.spo2
        }))
        setChartData(mappedData)
      } else {
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
    const interval = setInterval(() => {
      setChartData(prev => {
        const d = new Date()
        const timeStr = `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
        return [...prev.slice(1), { time: timeStr, hr: healthData.heartRate, spo2: healthData.spo2 }]
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [healthData.heartRate, healthData.spo2])

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        setAiInsight("Analyzing your vitals...")
        const ai = getGemini()
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Given these vitals: Heart Rate ${Math.round(healthData.heartRate)} bpm, SpO2 ${Math.round(healthData.spo2)}%, Temp ${healthData.temp.toFixed(1)}°F. Provide a single, short, encouraging 1-sentence daily health advice. No robotic tone.`
        const result = await model.generateContent(prompt);
        const response = await result.response;
        setAiInsight(response.text() || "Your vitals look stable. Keep staying hydrated!")
      } catch (e: any) {
        if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
          setAiInsight("Please try again after 15 minutes.")
        } else {
          setAiInsight("Your vitals are perfectly normal. Have a great day!")
        }
      }
    }
    // Only fetch automatically if we actually loaded a real user or on mount if no auth initially.
    // To prevent infinite re-fetching, we'll keep it on initial load, but allow manual refresh below.
    fetchInsight()
  }, [user?.id])

  const refreshAction = async () => {
    try {
      setAiInsight("Analyzing your vitals...")
      const ai = getGemini()
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Given these vitals: Heart Rate ${Math.round(healthData.heartRate)} bpm, SpO2 ${Math.round(healthData.spo2)}%, Temp ${healthData.temp.toFixed(1)}°F. Provide a single, short, encouraging 2-sentence daily health advice. No robotic tone.`
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiInsight(response.text() || "Your vitals look stable. Keep staying hydrated!")
    } catch (e: any) {
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
        setAiInsight("Please try again after 15 minutes.")
      } else {
        setAiInsight("Your vitals are perfectly normal. Have a great day!")
      }
    }
  }
  
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    navigate('/')
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <header className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0369A1]">HealthSync <span className="font-light text-[#38BDF8]">Smart</span></h1>
          <p className="text-slate-500 text-sm font-medium">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700">
            <LogOut className="w-5 h-5"/>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
            {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      <Card className="p-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-bold text-slate-800">Real-time Vitals</h2>
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">Live Data</span>
             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">৳{healthData.balance.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-around items-center">
          <CircularProgress 
            value={Math.round(healthData.heartRate)} 
            label="Heart Rate" 
            unit="BPM" 
            color="#F43F5E" 
            max={150} 
            status="NORMAL" 
            statusColor="text-green-500" 
          />
          <CircularProgress 
            value={Math.round(healthData.spo2)} 
            label="Oxygen" 
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
            label="Temperature" 
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
              <h3 className="font-bold text-slate-800">AI Recommendation</h3>
            </div>
            <button 
              onClick={refreshAction}
              className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-colors"
            >
              Update AI
            </button>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed italic">
            "{aiInsight}"
          </p>
        </div>
      </Card>

      <Card 
        className="p-4 bg-rose-50 border-rose-200 shadow-sm cursor-pointer hover:bg-rose-100 transition-colors flex items-center justify-between"
        onClick={() => navigate('/app/emergency')}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-md shadow-rose-500/30">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-rose-950">Emergency Contacts</h3>
            <p className="text-[10px] uppercase font-bold text-rose-500 mt-1">Hospitals & Ambulances</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-rose-200 flex items-center justify-center text-rose-400 bg-white">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 px-1 text-lg">Heart Rate Trend</h3>
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

