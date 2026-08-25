import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import Spinner from '../components/ui/Spinner'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RequireApproved({ children }: { children: ReactNode }) {
  const { user, loading, isApproved } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isApproved) return <Navigate to="/pending" replace />
  return <>{children}</>
}

export function RequireManager({ children }: { children: ReactNode }) {
  const { user, loading, isManager } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isManager) return <Navigate to="/" replace />
  return <>{children}</>
}
