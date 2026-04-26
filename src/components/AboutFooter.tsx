import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Info, X } from 'lucide-react'
import { Card } from './ui/Card'

export function AboutFooter() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <footer className="mt-auto py-8 px-6 text-center space-y-4">
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto"
      >
        <Info className="w-3.5 h-3.5" />
        About App
      </button>
      
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
        Copyright by Shahrat Islam
      </p>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[101] outline-none"
            >
              <Card className="p-6 bg-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-blue-500" />
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>

                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-sky-100 rounded-xl text-sky-600">
                    <Info className="w-5 h-5" />
                  </div>
                  System Info
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Version</span>
                    <span className="text-sky-600 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-100 italic">1.2.5</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Release Date</span>
                    <span className="text-slate-700 font-semibold italic">April 26, 2026</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Developer</span>
                    <span className="text-slate-700 font-bold italic">MD. Shahrat Islam</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 leading-relaxed italic text-center">
                      "Empowering local communities with smart, accessible, and automated healthcare solutions in Bogura."
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </footer>
  )
}
