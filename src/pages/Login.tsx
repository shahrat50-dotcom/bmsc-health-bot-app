import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { supabase } from '@/src/lib/supabase'

export function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Additional registration fields
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [age, setAge] = useState('')
  const [bloodType, setBloodType] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    if (email === 'shahrat50@gmail.com' && password === 'Shahrat777') {
      localStorage.setItem('admin_session', 'full')
      navigate('/admin')
      return;
    }

    if (email === 'viewer@admin.com' && password === '12345678') {
      localStorage.setItem('admin_session', 'viewer')
      navigate('/admin')
      return;
    }

    // Fallback if supabase isn't configured
    if (!supabase) {
      setTimeout(() => {
        if (email === 'shahrat50@gmail.com') {
          localStorage.setItem('admin_session', 'full')
          navigate('/admin')
        } else {
          navigate('/app')
        }
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
        setSuccessMsg('Registration successful! You can now sign in.')
        setIsRegister(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        if (email === 'shahrat50@gmail.com') {
          localStorage.setItem('admin_session', 'full')
          navigate('/admin')
        } else {
          navigate('/app')
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-center px-4 py-8">
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
        <Card className="p-6 md:p-8 backdrop-blur-xl bg-white/80 border-sky-100">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-600 font-medium">
              {successMsg}
            </div>
          )}
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
              <div className="mt-2 text-black relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border-0 py-3 pl-4 pr-12 text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 placeholder:text-sky-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-sky-500 hover:text-sky-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
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
      </motion.div>
    </div>
  )
}
