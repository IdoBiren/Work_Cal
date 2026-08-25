import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { user, loading, login } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">סידור עבודה</h1>
        <p className="text-slate-500 mb-6">התחברו כדי למלא זמינות ולראות את הסידור</p>
        <Button onClick={login} className="w-full py-3">
          התחברות עם Google
        </Button>
      </div>
    </div>
  )
}
