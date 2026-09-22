import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default ProtectedRoute