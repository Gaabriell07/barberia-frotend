import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminReservations from './pages/admin/AdminReservations'
import AdminUsers        from './pages/admin/AdminUsers'
import AdminBarbers      from './pages/admin/AdminBarbers'

import BookingPage        from './pages/client/BookingPage'
import MyReservationsPage from './pages/client/MyReservationsPage'

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDark = () => setDarkMode(d => !d)

  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route element={<AppLayout darkMode={darkMode} toggleDark={toggleDark} />}>
                <Route path="/admin/dashboard"    element={<AdminDashboard />} />
                <Route path="/admin/reservations" element={<AdminReservations />} />
                <Route path="/admin/barbers"      element={<AdminBarbers />} />
                <Route path="/admin/users"        element={<AdminUsers />} />
              </Route>
            </Route>

            {}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout darkMode={darkMode} toggleDark={toggleDark} />}>
                <Route path="/client/book"         element={<BookingPage />} />
                <Route path="/client/reservations" element={<MyReservationsPage />} />
              </Route>
            </Route>

            {}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
