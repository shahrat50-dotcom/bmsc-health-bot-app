import React, { useState, useEffect } from 'react'
import { Pill, CreditCard, Activity, AlertCircle, Heart, Thermometer, Droplets } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/src/lib/supabase'

export function History() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;

      const { data, error } = await supabase
        .from('vitals_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setHistory(data)
      }
      setLoading(false)
    }

    fetchHistory()
  }, [])

  return (
    <div className="flex flex-col p-6 space-y-6">
      <header className="pt-4 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0369A1]">Vitals History</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Logged by Medical Staff</p>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-sky-900/5 border border-white">
        {loading ? (
          <div className="flex flex-col items-center py-10 gap-3">
             <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Logs...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3">
             <div className="p-4 bg-slate-50 rounded-full">
               <Activity className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-sm font-bold text-slate-400">No medical overrides recorded.</p>
          </div>
        ) : (
          <div className="space-y-6 overflow-hidden">
            {history.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4 relative pb-6">
                {index !== history.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100"></div>
                )}
                <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex-shrink-0 bg-sky-100`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Vitals Updated</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{format(new Date(item.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-emerald-500 uppercase">Success</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <HistoryChip icon={<Heart className="w-3 h-3 text-rose-500" />} value={`${item.heart_rate} BPM`} />
                    <HistoryChip icon={<Droplets className="w-3 h-3 text-sky-500" />} value={`${item.spo2}%`} />
                    <HistoryChip icon={<Thermometer className="w-3 h-3 text-amber-500" />} value={`${item.temp}°F`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Spacer */}
      <div className="h-10"></div>
    </div>
  )
}

function HistoryChip({ icon, value }: { icon: React.ReactNode, value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1.5 overflow-hidden">
      {icon}
      <span className="text-[10px] font-bold text-slate-700 truncate">{value}</span>
    </div>
  )
}
