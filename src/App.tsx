/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Scan } from './pages/Scan'
import { History } from './pages/History'
import { Profile } from './pages/Profile'
import { Admin } from './pages/Admin'
import { Reminders } from './pages/Reminders'
import { EmergencyContacts } from './pages/EmergencyContacts'
import { Chat } from './pages/Chat'
import { MobileLayout } from './components/Layout/MobileLayout'
import { AuthLayout } from './components/Layout/AuthLayout'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
        </Route>
        
        <Route path="/app" element={<MobileLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="scan" element={<Scan />} />
          <Route path="history" element={<History />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="emergency" element={<EmergencyContacts />} />
        </Route>

        <Route path="/admin" element={<Admin />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
