import React, { useState, useEffect } from 'react'
import { Users, Server, DollarSign, Activity, ArrowLeft, Heart, Droplets, Thermometer, Save, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { getVitals, updateVitals } from '@/src/lib/vitals'

export function Admin() {
  const navigate = useNavigate()
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Alex Marshall', email: 'alex@example.com', balance: 1245.50, status: 'Active' },
    { id: 2, name: 'Alice Smith', email: 'alice@example.com', balance: 42.50, status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', balance: 12.00, status: 'Active' },
    { id: 4, name: 'Charlie Davis', email: 'charlie@example.com', balance: 5.50, status: 'Locked' },
  ])

  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  
  // Vitals edit state
  const [editVitals, setEditVitals] = useState({
    heartRate: 72,
    spo2: 98,
    temp: 36.6
  })

  // Balance edit state
  const [editBalance, setEditBalance] = useState(0)

  const handleEditClick = (user: any) => {
    if (editingUserId === user.id) {
      setEditingUserId(null)
      return
    }
    setEditingUserId(user.id)
    setEditBalance(user.balance)
    setEditVitals(getVitals(user.id))
  }

  const handleSave = (userId: number) => {
    updateVitals(userId, {
      heartRate: Number(editVitals.heartRate),
      spo2: Number(editVitals.spo2),
      temp: Number(editVitals.temp)
    })
    
    setUsers(users.map(u => u.id === userId ? { ...u, balance: Number(editBalance) } : u))
    setEditingUserId(null)
  }

  return (
    <div className="absolute inset-0 bg-slate-50 z-[100] flex flex-col p-6 overflow-y-auto w-full max-w-full rounded-none md:rounded-none">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Manual Data Override System</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value="1,248" />
          <StatCard icon={<Server className="w-5 h-5" />} label="Active Machines" value="42" />
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="Revenue (Today)" value="$1,402.50" />
          <StatCard icon={<Activity className="w-5 h-5" />} label="System Health" value="99.9%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">User Management</h2>
            <Card className="overflow-hidden border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Balance</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {users.map(user => (
                      <React.Fragment key={user.id}>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-slate-500">{user.email}</td>
                          <td className="px-6 py-4 font-medium">${user.balance.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleEditClick(user)}
                              className="text-sky-600 hover:text-sky-800 font-bold text-xs uppercase tracking-wider"
                            >
                              {editingUserId === user.id ? 'Cancel' : 'Edit Vitals'}
                            </button>
                          </td>
                        </tr>
                        {editingUserId === user.id && (
                          <tr className="bg-sky-50/50 border-b border-sky-100">
                            <td colSpan={5} className="p-6">
                              <div className="bg-white p-6 rounded-2xl border border-sky-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-bold text-slate-800">Manual Data Control Center</h4>
                                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">ADMIN OVERRIDE</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Heart className="w-4 h-4 text-rose-500" /> Heart Rate (BPM)
                                    </label>
                                    <input 
                                      type="number" 
                                      className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                      value={editVitals.heartRate}
                                      onChange={(e) => setEditVitals({...editVitals, heartRate: Number(e.target.value)})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Droplets className="w-4 h-4 text-sky-500" /> Oxygen (SpO2%)
                                    </label>
                                    <input 
                                      type="number" 
                                      className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                      value={editVitals.spo2}
                                      onChange={(e) => setEditVitals({...editVitals, spo2: Number(e.target.value)})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Thermometer className="w-4 h-4 text-amber-500" /> Temperature (°C)
                                    </label>
                                    <input 
                                      type="number" 
                                      step="0.1"
                                      className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                      value={editVitals.temp}
                                      onChange={(e) => setEditVitals({...editVitals, temp: Number(e.target.value)})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <DollarSign className="w-4 h-4 text-emerald-500" /> Card Balance
                                    </label>
                                    <input 
                                      type="number" 
                                      step="0.01"
                                      className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                      value={editBalance}
                                      onChange={(e) => setEditBalance(Number(e.target.value))}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Button variant="outline" size="sm" onClick={() => setEditingUserId(null)} className="flex items-center gap-2 border-slate-200">
                                    <X className="w-4 h-4" /> Cancel
                                  </Button>
                                  <Button size="sm" onClick={() => handleSave(user.id)} className="flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Broadcast to User App
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Vending Machines</h2>
            <div className="space-y-4">
              <MachineCard name="Terminal A1 (Lobby)" status="Online" stock="98%" />
              <MachineCard name="Terminal B2 (Ward 3)" status="Online" stock="45%" warning />
              <MachineCard name="Terminal C1 (ER)" status="Maintenance" stock="0%" error />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: any) {
  return (
    <Card className="p-6 border-slate-200 bg-white shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  )
}

function MachineCard({ name, status, stock, warning, error }: any) {
  return (
    <Card className={`p-4 border-l-4 shadow-sm ${error ? 'border-l-rose-500 bg-rose-50/30' : warning ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-green-500 bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-800">{name}</h4>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          error ? 'bg-rose-100 text-rose-700' : warning ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Inventory</span>
        <span className={`font-medium ${warning ? 'text-amber-600' : 'text-slate-700'}`}>{stock} Full</span>
      </div>
    </Card>
  )
}
