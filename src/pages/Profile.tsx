import React, { useState } from 'react'
import { LogOut, CreditCard, User as UserIcon, Shield, Settings, Wifi } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { supabase } from '@/src/lib/supabase'

// Update balance from Supabase
export function Profile() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [userFullName, setUserFullName] = useState('Anonymous')

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance, full_name')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setBalance(data.balance || 0)
          if (data.full_name) {
            setUserFullName(data.full_name)
          }
        }
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    navigate('/')
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <header className="pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0369A1]">Profile</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Account & Card</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <Settings className="w-5 h-5 text-sky-600" />
        </Button>
      </header>

      {/* Card UI */}
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">NFC Health Card</p>
        <p className="text-3xl font-bold mb-6">৳{balance.toFixed(2)}</p>
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-[10px] opacity-70">CARD HOLDER</p>
            <p className="text-sm font-medium uppercase">{userFullName}</p>
            <p className="text-xs text-white/60 mt-1">•••• 4021</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-[10px] font-bold">NFC</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button className="flex-1">Top-up Balance</Button>
        <Button variant="outline" className="flex-1 bg-white">Lock Card</Button>
      </div>

      <div className="space-y-3 mt-4">
        <h3 className="text-sm font-semibold text-sky-900 uppercase tracking-widest px-2 mb-2">Settings</h3>
        
        <Card className="p-2 border-sky-100 shadow-sm cursor-pointer hover:border-sky-300 transition-colors">
          <div className="flex items-center gap-4 p-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sky-950">Personal Info</h4>
              <p className="text-xs text-sky-600/70">Name, email, medical history</p>
            </div>
          </div>
        </Card>

        <Card className="p-2 border-sky-100 shadow-sm cursor-pointer hover:border-sky-300 transition-colors">
          <div className="flex items-center gap-4 p-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sky-950">Privacy & Security</h4>
              <p className="text-xs text-sky-600/70">Biometrics, password</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-2 border-rose-100 shadow-sm cursor-pointer hover:border-rose-300 transition-colors bg-rose-50/30"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-4 p-2 text-rose-600">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 font-medium">Log Out</div>
          </div>
        </Card>
      </div>
      
      {/* Spacer */}
      <div className="h-10"></div>
    </div>
  )
}
