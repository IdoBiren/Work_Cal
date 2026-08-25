import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import Spinner from '../components/ui/Spinner'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, needsProfile } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (needsProfile) return <Navigate to="/complete-profile" replace />
  return <>{children}</>
}

export function RequireApproved({ children }: { children: ReactNode }) {
  const { user, loading, needsProfile, isApproved } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (needsProfile) return <Navigate to="/complete-profile" replace />
  if (!isApproved) return <Navigate to="/pending" replace />
  return <>{children}</>
}

export function RequireManager({ children }: { children: ReactNode }) {
  const { user, loading, needsProfile, isManager } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (needsProfile) return <Navigate to="/complete-profile" replace />
  if (!isManager) return <Navigate to="/" replace />
  return <>{children}</>
}
