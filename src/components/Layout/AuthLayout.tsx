import React from 'react'
import { Outlet } from 'react-router-dom'
import { AboutFooter } from '../AboutFooter'

export function AuthLayout() {
  return (
    <div className="flex h-screen w-full justify-center bg-sky-50/50">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-background shadow-2xl sm:rounded-[3rem] sm:border-[8px] sm:border-gray-900 sm:h-[90vh] sm:my-auto">
        <main className="flex-1 overflow-y-auto flex flex-col pt-8">
          <div className="flex-1">
            <Outlet />
          </div>
          <AboutFooter />
        </main>
      </div>
    </div>
  )
}
