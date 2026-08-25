import { useAuth } from '../auth/AuthProvider'
import Button from '../components/ui/Button'

export default function PendingPage() {
  const { profile, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm w-full">
        <h1 className="text-xl font-bold text-slate-800 mb-2">ממתין לאישור מנהל</h1>
        <p className="text-slate-500 mb-6">
          שלום {profile?.displayName ?? ''}, החשבון שלך נרשם וממתין לאישור. פנה למנהל כדי שיאשר אותך במערכת.
        </p>
        <Button variant="secondary" onClick={logout}>
          יציאה
        </Button>
      </div>
    </div>
  )
}
