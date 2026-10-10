import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { token } = useAuth()
  const location = useLocation()
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
