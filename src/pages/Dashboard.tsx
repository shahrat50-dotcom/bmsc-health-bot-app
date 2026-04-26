import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, Droplets, Thermometer, Sparkles, PhoneCall } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { Card } from '@/src/components/ui/Card'
import { getGemini } from '@/src/lib/gemini'

// Mock data generator for the chart
const generateInitialChartData = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    time: `${i * 2}:00`,
    hr: 60 + Math.random() * 40,
    spo2: 95 + Math.random() * 5,
  }))
}

export function Dashboard() {
  const navigate = useNavigate()
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    spo2: 98,
    temp: 36.6,
  })
  const [chartData, setChartData] = useState(generateInitialChartData())
  const [aiInsight, setAiInsight] = useState("Analyzing your vitals...")

  // We assume user 1 is "Alex"
  useEffect(() => {
    const loadVitals = () => {
      const stored = localStorage.getItem('health_vitals_1')
      if (stored) {
        setHealthData(JSON.parse(stored))
      }
    }
    
    loadVitals() // Initial load
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'health_vitals_1') {
        loadVitals()
      }
    }

    const handleCustomEvent = () => loadVitals()

    window.addEventListener('storage', handleStorage)
    window.addEventListener('vitals_updated', handleCustomEvent)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('vitals_updated', handleCustomEvent)
    }
  }, [])

  useEffect(() => {
    // Add point to chart over time based on current HR
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
    // Fetch AI insight
    const fetchInsight = async () => {
      try {
        const ai = getGemini()
        const prompt = `Given these vitals: Heart Rate ${Math.round(healthData.heartRate)} bpm, SpO2 ${Math.round(healthData.spo2)}%, Temp ${healthData.temp.toFixed(1)}°C. Provide a single, short, encouraging 1-sentence daily health advice. No robotic tone.`
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        })
        setAiInsight(response.text || "Your vitals look stable. Keep staying hydrated!")
      } catch (e) {
        setAiInsight("Your vitals are perfectly normal. Have a great day!")
      }
    }
    fetchInsight()
  }, [])

  return (
    <div className="flex flex-col p-6 space-y-6">
      <header className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0369A1]">HealthSync <span className="font-light text-[#38BDF8]">Smart</span></h1>
          <p className="text-slate-500 text-sm font-medium">Welcome back, Alex</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 border-4 border-white shadow-md"></div>
        </div>
      </header>

      <Card className="p-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-bold text-slate-800">Real-time Vitals</h2>
          <span className="text-[10px] font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">Live Data</span>
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
            unit="°C" 
            color="#F59E0B" 
            max={40} 
            status="NORMAL" 
            statusColor="text-amber-500" 
          />
        </div>
      </Card>

      <Card className="overflow-hidden border border-sky-100 shadow-xl shadow-sky-900/5">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <h3 className="font-bold text-slate-800">AI Recommendation</h3>
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
        <Card className="h-64 p-4 flex flex-col pt-6 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0c4a6e', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="hr" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHr)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-6"></div>
    </div>
  )
}

function CircularProgress({ value, label, unit, color, max, status, statusColor }: any) {
  const percentage = Math.min(100, Math.max(0, (Number(value) / max) * 100))
  // circum is ~ 251 for r=40
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
