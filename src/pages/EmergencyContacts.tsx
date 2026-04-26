import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Phone, Navigation, ArrowLeft, Ambulance, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'

const HOSPITALS = [
  { id: 1, name: 'Shaheed Ziaur Rahman Medical College (SZMC)', distance: '4.5 - 5 km', phone: '02589-904151', status: 'Chilimpur' },
  { id: 2, name: '250 Bed Mohammad Ali Hospital', distance: '1.5 - 2 km', phone: '02589-910550', status: 'Station Road' },
  { id: 3, name: 'Ibn Sina Diagnostic & Consultation Center', distance: '1.5 km', phone: '01701-560001', status: 'Sherpur Road' },
  { id: 4, name: 'Popular Diagnostic Centre', distance: '1 km', phone: '09613787812', status: 'Thanthania' },
  { id: 5, name: 'Islami Bank Hospital', distance: '1.5 km', phone: '01724-440400', status: 'Thanthania' },
  { id: 6, name: 'Health City Specialized Hospital', distance: '2 km', phone: '01790-181818', status: 'Sherpur Road' },
  { id: 7, name: 'TMSS Medical College & Hospital', distance: '8 - 9 km', phone: '01731-057432', status: 'Thengamara' },
  { id: 8, name: 'Bogura Diabetic Hospital', distance: '3 km', phone: '051-65024', status: 'Jahurul Nagar' },
]

const AMBULANCES = [
  { id: 1, name: 'Riad Ambulance Service (Local)', distance: 'Available', phone: '01953-921890', time: 'Local' },
  { id: 2, name: 'Bogura to Dhaka Ambulance Service', distance: 'Inter-City', phone: '01911-125156', time: 'Long Distance' },
  { id: 3, name: 'SZMC Hospital Ambulance', distance: 'At Hospital', phone: '01769-104089', time: 'Medical College' },
  { id: 4, name: 'Red Crescent Ambulance (Bogura)', distance: 'Various', phone: '051-66203', time: 'Emergency' },
  { id: 5, name: 'Mohammad Ali Hospital Ambulance', distance: 'At Hospital', phone: '051-66107', time: 'General Hospital' },
  { id: 6, name: 'Popular Ambulance Helpline', distance: 'Private', phone: '01953-921890', time: '24/7' },
]

export function EmergencyContacts() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'hospitals' | 'ambulances'>('hospitals')

  return (
    <div className="flex flex-col p-6 space-y-6">
      <header className="flex items-center gap-4 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white shadow-sm h-10 w-10">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#0369A1]">Emergency</h1>
          <p className="text-slate-500 text-sm font-medium">Nearby Support</p>
        </div>
      </header>

      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-sky-100">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'hospitals'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-sky-500'
          }`}
        >
          Hospitals
        </button>
        <button
          onClick={() => setActiveTab('ambulances')}
          className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'ambulances'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-rose-500'
          }`}
        >
          Ambulances
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'hospitals' ? (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {HOSPITALS.map((hospital) => (
              <Card key={hospital.id} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{hospital.name}</h3>
                      <p className="text-xs text-sky-500 font-medium flex items-center gap-1 mt-0.5">
                        <Navigation className="w-3 h-3" /> {hospital.distance} away
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">
                    {hospital.status}
                  </span>
                </div>
                <a 
                  href={`tel:${hospital.phone}`}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" /> CALL NOW
                </a>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {AMBULANCES.map((ambulance) => (
              <Card key={ambulance.id} className="p-5 flex flex-col gap-4 border-rose-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                      <Ambulance className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{ambulance.name}</h3>
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                        <Navigation className="w-3 h-3" /> {ambulance.distance} away
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md uppercase">
                    {ambulance.time}
                  </span>
                </div>
                <a 
                  href={`tel:${ambulance.phone}`}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl text-center text-sm font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
                >
                  <Phone className="w-4 h-4" /> REQUEST AMBULANCE
                </a>
              </Card>
            ))}
          </motion.div>
        )}
      </div>

      <div className="h-10"></div>
    </div>
  )
}
