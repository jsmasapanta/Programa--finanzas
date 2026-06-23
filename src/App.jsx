import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import { Spinner } from './components/ui'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Ingresos from './pages/Ingresos'
import Gastos from './pages/Gastos'
import Deudas from './pages/Deudas'
import Tarjetas from './pages/Tarjetas'
import Pagos from './pages/Pagos'
import Amortizacion from './pages/Amortizacion'
import Reportes from './pages/Reportes'
import Perfil from './pages/Perfil'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Spinner size={40} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ingresos" element={<Ingresos />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/deudas" element={<Deudas />} />
        <Route path="/tarjetas" element={<Tarjetas />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/amortizacion" element={<Amortizacion />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
