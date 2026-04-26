import React, { useState, useEffect } from 'react'
import { Users, Server, DollarSign, Activity, ArrowLeft, Heart, Droplets, Thermometer, Save, X, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { supabase } from '@/src/lib/supabase'

export function Admin() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])

  const [activeMachines, setActiveMachines] = useState(() => {
    return parseInt(localStorage.getItem('admin_active_machines') || '22', 10)
  })
  
  const [systemHealth, setSystemHealth] = useState(() => {
    return parseFloat(localStorage.getItem('admin_system_health') || '99.9')
  })

  // update local storage when they change
  useEffect(() => {
    localStorage.setItem('admin_active_machines', activeMachines.toString())
    localStorage.setItem('admin_system_health', systemHealth.toString())
  }, [activeMachines, systemHealth])

  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  
  // Vitals edit state
  const [editVitals, setEditVitals] = useState({
    heartRate: 72,
    spo2: 98,
    temp: 36.6
  })

  // Balance edit state
  const [editBalance, setEditBalance] = useState(0)

  useEffect(() => {
    const fetchUsers = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')
        
      if (data) {
        setUsers(data)
      }
    }
    fetchUsers()

    if (supabase) {
      const channel = supabase
        .channel('public:profiles_admin')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'profiles' 
          }, 
          (payload) => {
             if (payload.eventType === 'UPDATE') {
               setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u))
             } else if (payload.eventType === 'INSERT') {
               setUsers(prev => [...prev, payload.new])
             } else if (payload.eventType === 'DELETE') {
               setUsers(prev => prev.filter(u => u.id !== payload.old.id))
             }
          }
        )
        .subscribe()
      
      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const handleEditClick = (user: any) => {
    if (editingUserId === user.id) {
      setEditingUserId(null)
      return
    }
    setEditingUserId(user.id)
    setEditBalance(user.balance || 0)
    setEditVitals({
      heartRate: user.heart_rate || 72,
      spo2: user.spo2 || 98,
      temp: user.temp || 36.6
    })
  }

  const handleSave = async (userId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        heart_rate: Number(editVitals.heartRate),
        spo2: Number(editVitals.spo2),
        temp: Number(editVitals.temp),
        balance: Number(editBalance)
      })
      .eq('id', userId)
      
    if (!error) {
      setEditingUserId(null)
    }
  }
  
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    navigate('/')
  }

  return (
    <div className="absolute inset-0 bg-slate-50 z-[100] flex flex-col p-6 overflow-y-auto w-full max-w-full rounded-none md:rounded-none">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1">Manual Data Override System</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={users.length.toString()} />
          <StatCard 
            icon={<Server className="w-5 h-5" />} 
            label="Active Machines" 
            value={activeMachines.toString()} 
            action={
              <div className="flex flex-col gap-1">
                <button onClick={() => setActiveMachines(p => p + 1)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded px-2 py-0.5 font-bold">+</button>
                <button onClick={() => setActiveMachines(p => Math.max(0, p - 1))} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded px-2 py-0.5 font-bold">-</button>
              </div>
            }
          />
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="Revenue (Today)" value={`৳${users.reduce((acc, user) => acc + (user.balance || 0), 0).toFixed(2)}`} />
          <StatCard 
            icon={<Activity className="w-5 h-5" />} 
            label="System Health" 
            value={`${systemHealth}%`} 
            action={
              <div className="flex flex-col gap-1">
                <button onClick={() => setSystemHealth(p => Math.min(100, parseFloat((p + 0.1).toFixed(1))))} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded px-2 py-0.5 font-bold">+</button>
                <button onClick={() => setSystemHealth(p => Math.max(0, parseFloat((p - 0.1).toFixed(1))))} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded px-2 py-0.5 font-bold">-</button>
              </div>
            }
          />
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
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No users registered yet.
                        </td>
                      </tr>
                    ) : users.map(user => (
                      <React.Fragment key={user.id}>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-slate-900">{user.full_name || 'Anonymous'}</td>
                          <td className="px-6 py-4 text-slate-500">{user.email}</td>
                          <td className="px-6 py-4 font-medium">৳{(user.balance || 0).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Active
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


function StatCard({ icon, label, value, action }: any) {
  return (
    <Card className="p-6 border-slate-200 bg-white shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
      {action && <div>{action}</div>}
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
