import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, Plus, Trash2, Clock, Pill, CheckCircle2 } from 'lucide-react'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { supabase } from '@/src/lib/supabase'

interface Reminder {
  id: string
  medicine_name: string
  time: string
  active: boolean
}

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTime, setNewTime] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
    fetchReminders()
  }, [])

  // Notification logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      reminders.forEach(reminder => {
        if (reminder.active && reminder.time === currentTime) {
          showNotification(reminder.medicine_name)
          // Simple debouncing to avoid multiple notifications in the same minute
        }
      })
    }, 30000) // check every 30 seconds

    return () => clearInterval(timer)
  }, [reminders])

  const fetchReminders = async () => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('medicine_reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('time', { ascending: true })

    if (!error && data) {
      setReminders(data)
    }
    setLoading(false)
  }

  const showNotification = (medicineName: string) => {
    if (Notification.permission === 'granted') {
      new Notification('Medicine Reminder', {
        body: `It's time to take your: ${medicineName}`,
        icon: '/pwa-192x192.png'
      })
    }
  }

  const requestPermission = async () => {
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
  }

  const addReminder = async () => {
    if (!newName || !newTime || !supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('medicine_reminders')
      .insert([
        { user_id: user.id, medicine_name: newName, time: newTime, active: true }
      ])
      .select()

    if (!error && data) {
      setReminders([...reminders, data[0]].sort((a,b) => a.time.localeCompare(b.time)))
      setShowAdd(false)
      setNewName('')
      setNewTime('')
    }
  }

  const deleteReminder = async (id: string) => {
    if (!supabase) return
    const { error } = await supabase
      .from('medicine_reminders')
      .delete()
      .eq('id', id)

    if (!error) {
      setReminders(reminders.filter(r => r.id !== id))
    }
  }

  const toggleReminder = async (id: string, active: boolean) => {
    if (!supabase) return
    const { error } = await supabase
      .from('medicine_reminders')
      .update({ active: !active })
      .eq('id', id)

    if (!error) {
      setReminders(reminders.map(r => r.id === id ? { ...r, active: !active } : r))
    }
  }

  return (
    <div className="p-4 safe-area-bottom min-h-screen bg-slate-50/50 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reminders</h1>
          <p className="text-slate-500 text-sm">Don't miss your doses</p>
        </div>
        <Button 
          onClick={() => setShowAdd(true)}
          className="rounded-full w-12 h-12 p-0 bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {notificationPermission !== 'granted' && (
        <Card className="p-4 mb-6 bg-amber-50 border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Enable Notifications</p>
              <p className="text-xs text-amber-700">Stay alerted for your medicine</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-xs border-amber-300" onClick={requestPermission}>
            Enable
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading your schedule...</div>
        ) : reminders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No reminders yet</p>
            <p className="text-slate-400 text-sm">Tap + to add your first medicine</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`p-4 transition-all ${reminder.active ? 'opacity-100' : 'opacity-60 grayscale-[0.5]'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${reminder.active ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{reminder.medicine_name}</h3>
                      <div className="flex items-center gap-1.5 text-sky-600 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm">{reminder.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleReminder(reminder.id, reminder.active)}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${reminder.active ? 'bg-sky-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${reminder.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <button 
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-12 z-50 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
              <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Reminder</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Medicine Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full h-14 bg-slate-100 rounded-2xl px-5 font-medium border-none focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Time</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full h-14 bg-slate-100 rounded-2xl px-5 font-medium border-none focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl border-slate-200"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-14 rounded-2xl bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200"
                  onClick={addReminder}
                >
                  Set Reminder
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
