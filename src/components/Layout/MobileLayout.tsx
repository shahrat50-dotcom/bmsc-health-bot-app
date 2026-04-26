import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, ScanLine, History, User, Bell } from 'lucide-react'
import { motion } from 'motion/react'

import { AboutFooter } from '../AboutFooter'

export function MobileLayout() {
  return (
    <div className="flex h-screen w-full justify-center bg-[#F0F9FF] text-slate-900 font-sans">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden sm:border-x sm:border-sky-100 sm:shadow-2xl">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-28 relative hide-scrollbar flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <AboutFooter />
        </main>

        {/* Bottom Navigation */}
        <div className="absolute bottom-6 left-6 right-6">
          <nav className="bg-white rounded-[2.5rem] p-3 flex justify-between items-center shadow-2xl shadow-sky-900/20 border border-white overflow-x-auto gap-1">
            <NavItem to="/app" icon={(<svg className="w-5 h-5 mx-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>)} label="Home" />
            <NavItem to="/app/reminders" icon={(<Bell className="w-5 h-5 mx-auto flex-shrink-0" />)} label="Alerts" />
            <NavItem to="/app/scan" icon={(<svg className="w-6 h-6 mx-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" /></svg>)} label="Scan" isCenter />
            <NavItem to="/app/chat" icon={(<svg className="w-5 h-5 mx-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>)} label="AI" />
            <NavItem to="/app/history" icon={(<svg className="w-5 h-5 mx-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)} label="History" />
          </nav>
        </div>
      </div>
    </div>
  )
}

function NavItem({ to, icon, label, isCenter }: { to: string; icon: React.ReactNode; label: string; isCenter?: boolean }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) =>
        `flex-1 flex justify-center text-slate-400 hover:text-sky-500 cursor-pointer transition-colors outline-none decoration-transparent
        `
      }
    >
      {({ isActive }) => (
        <>
          {isCenter ? (
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg -translate-y-2 border-4 border-[#F0F9FF]">
              {icon}
            </div>
          ) : isActive ? (
            <div className="bg-sky-500 text-white px-6 py-2 rounded-full flex items-center gap-2">
              {icon}
              <span className="text-xs font-bold">{label}</span>
            </div>
          ) : (
            <div className="py-2">
              {icon}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}
