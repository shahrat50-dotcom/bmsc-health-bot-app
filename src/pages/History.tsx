import React from 'react'
import { Pill, CreditCard, Activity, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const HISTORY_DATA = [
  {
    id: 1,
    type: 'purchase',
    title: 'Paracetamol 500mg',
    desc: 'Vending Machine A2',
    amount: -2.50,
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: 2,
    type: 'alert',
    title: 'High Heart Rate',
    desc: 'Spiked to 110 bpm during workout',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 3,
    type: 'topup',
    title: 'Card Top-up',
    desc: 'Bank Transfer ending in 4021',
    amount: 50.00,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: 4,
    type: 'purchase',
    title: 'Vitamin D3',
    desc: 'Vending Machine B1',
    amount: -8.00,
    date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  }
]

export function History() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <header className="pt-4 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0369A1]">History</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Recent Activity</p>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-sky-900/5 border border-white">
        <div className="space-y-6 overflow-hidden">
          {HISTORY_DATA.map((item, index) => (
            <div key={item.id} className="flex items-start gap-4 relative pb-6">
              {index !== HISTORY_DATA.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100"></div>
              )}
              <TimelineIcon type={item.type} />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc} • {format(item.date, 'MMM d, h:mm a')}</p>
                {item.amount ? (
                  <p className={`text-[10px] font-bold mt-1 ${item.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.amount > 0 ? '+' : '-'} ৳{Math.abs(item.amount).toFixed(2)}
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-emerald-500 mt-1">STABLE</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Spacer */}
      <div className="h-10"></div>
    </div>
  )
}

function TimelineIcon({ type }: { type: string }) {
  let bg = "bg-sky-100"

  if (type === 'purchase') {
    bg = "bg-sky-100"
  } else if (type === 'topup') {
    bg = "bg-emerald-100"
  } else if (type === 'alert') {
    bg = "bg-amber-100"
  }

  return (
    <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex-shrink-0 ${bg}`}></div>
  )
}
