import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { supabase } from '@/src/lib/supabase'

export function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  
  // Additional registration fields
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [age, setAge] = useState('')
  const [bloodType, setBloodType] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Fallback if supabase isn't configured
    if (!supabase) {
      setTimeout(() => {
        navigate('/app')
        setLoading(false)
      }, 1000)
      return
    }

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: name,
              address,
              age,
              blood_type: bloodType
            }
          }
        })
        if (error) throw error
        alert('Registration successful! Please sign in.')
        setIsRegister(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        if (email === 'shahrat50@gmail.com') {
          navigate('/admin')
        } else {
          navigate('/app')
        }
      }
    } catch (err: any) {
      alert(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-sm text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-400 to-sky-500 shadow-xl shadow-sky-500/30">
          <Activity className="h-10 w-10 text-white" />
        </div>
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-sky-900">
          SmartHealth
        </h2>
        <p className="mt-2 text-sm text-sky-600/80">
          Automated Medicine & Monitoring
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm"
      >
        <Card className="p-8 backdrop-blur-xl bg-white/80 border-sky-100">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-medium text-sky-900">
                Email address
              </label>
              <div className="mt-2 text-black">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border-0 py-3 px-4 text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 placeholder:text-sky-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-sky-900">
                    Full Name
                  </label>
                  <div className="mt-2 text-black">
                    <input
                      type="text"
                      required={isRegister}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="block w-full rounded-2xl border-0 py-3 px-4 text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 placeholder:text-sky-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 bg-white/50 backdrop-blur-sm transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-900">
                    Address
                  </label>
                  <div className="mt-2 text-black">
                    <input
                      type="text"
                      required={isRegister}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="block w-full rounded-2xl border-0 py-3 px-4 text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 placeholder:text-sky-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 bg-white/50 backdrop-blur-sm transition-all"
                      placeholder="123 Main St"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sky-900">
                      Age
                    </label>
                    <div className="mt-2 text-black">
                      <input
                        type="number"
                        required={isRegister}
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        className="block w-full rounded-2xl border-0 py-3 px-4 text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 placeholder:text-sky-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 bg-white/50 backdrop-blur-sm transition-all"
                        placeholder="25"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sky-900">
                      Blood Type
                    </label>
                    <div className="mt-2 text-black">
                      <input
                        type="text"
                        required={isRegister}
                        value={bloodType}
                        onChange={e => setBloodType(e.target.value)}
                        className="block w-full rounded-2xl border-0 py-3 px-4 text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 placeholder:text-sky-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 bg-white/50 backdrop-blur-sm transition-all"
                        placeholder="O+"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-sky-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border-0 py-3 px-4 text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 placeholder:text-sky-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-base mt-4" disabled={loading}>
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-medium text-sky-600 hover:text-sky-500 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-sky-600/60">
          <ShieldCheck className="h-4 w-4" />
          <span>Secured by Supabase Identity</span>
        </div>
      </motion.div>
    </div>
  )
}
