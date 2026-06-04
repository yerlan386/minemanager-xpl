import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import ShiftPage from './pages/shift/ShiftPage'
import HRPage from './pages/hr/HRPage'
import OperationsPage from './pages/operations/OperationsPage'
import CompliancePage from './pages/compliance/CompliancePage'
import GoldRoom from './pages/goldroom/GoldRoom'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/60 text-sm">Loading…</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="shift/*" element={<ShiftPage />} />
        <Route path="hr/*" element={<HRPage />} />
        <Route path="operations/*" element={<OperationsPage />} />
        <Route path="compliance/*" element={<CompliancePage />} />
        <Route path="goldroom" element={<GoldRoom />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
