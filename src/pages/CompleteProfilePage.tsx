import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import Button from '../components/ui/Button'
import { errorMessage } from '../lib/errors'

export default function CompleteProfilePage() {
  const { user, profile, loading, completeProfile } = useAuth()
  const [name, setName] = useState(user?.displayName ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reachable directly (old bookmark/tab, browser history) regardless of
  // actual account state — self-correct instead of showing a stale form
  // whose submit the rules will reject anyway.
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (profile) return <Navigate to="/" replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    setError(null)
    try {
      await completeProfile(trimmed)
    } catch (err) {
      setError(errorMessage(err, 'שמירת השם נכשלה.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="text-center max-w-sm w-full">
        <h1 className="text-xl font-bold text-slate-800 mb-2">איך קוראים לך?</h1>
        <p className="text-slate-500 mb-4">השם הזה יוצג למנהל ולשאר העובדים בסידור העבודה.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם מלא"
          autoFocus
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 text-center"
        />
        <Button type="submit" disabled={submitting || !name.trim()} className="w-full py-3">
          {submitting ? 'שומר...' : 'המשך'}
        </Button>
        {error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-right">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
