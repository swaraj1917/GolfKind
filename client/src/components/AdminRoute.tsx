import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface AdminRouteProps {
  children: ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth()

  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!error && data?.role === 'admin') {
        setIsAdmin(true)
      }

      setLoading(false)
    }

    if (!authLoading) {
      checkAdmin()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <main>
        <p>Checking admin access...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default AdminRoute