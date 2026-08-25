import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import Button from '../components/ui/Button'

export default function CompleteProfilePage() {
  const { user, completeProfile } = useAuth()
  const [name, setName] = useState(user?.displayName ?? '')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      await completeProfile(trimmed)
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
          המשך
        </Button>
      </form>
    </div>
  )
}
