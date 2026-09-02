import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import Button from '../components/ui/Button'
import { errorMessage } from '../lib/errors'

export default function LoginPage() {
  const { user, loading, login, authError } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  const handleLogin = async () => {
    setError(null)
    setBusy(true)
    try {
      await login()
    } catch (err) {
      setError(errorMessage(err, 'ההתחברות נכשלה.'))
    } finally {
      setBusy(false)
    }
  }

  const shown = error ?? authError

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">סידור עבודה</h1>
        <p className="text-slate-500 mb-6">התחברו כדי למלא זמינות ולראות את הסידור</p>
        <Button onClick={handleLogin} disabled={busy} className="w-full py-3">
          {busy ? 'מתחבר...' : 'התחברות עם Google'}
        </Button>
        {shown && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-right">
            {shown}
          </p>
        )}
      </div>
    </div>
  )
}
