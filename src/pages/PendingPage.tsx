import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import Button from '../components/ui/Button'

export default function PendingPage() {
  const { profile, logout } = useAuth()
  const [checking, setChecking] = useState(false)

  const rejected = profile?.status === 'rejected'

  // The profile listener is live, so "check again" just gives the user
  // something to do; a reload also re-runs the whole auth flow cleanly.
  const checkAgain = () => {
    setChecking(true)
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm w-full">
        {rejected ? (
          <>
            <h1 className="text-xl font-bold text-slate-800 mb-2">הגישה שלך נחסמה</h1>
            <p className="text-slate-500 mb-6">
              שלום {profile?.displayName ?? ''}, החשבון שלך אינו מאושר לשימוש במערכת. אם זו טעות, פנו למנהל.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-800 mb-2">ממתין לאישור מנהל</h1>
            <p className="text-slate-500 mb-2">
              שלום {profile?.displayName ?? ''}, ההרשמה שלך נרשמה בהצלחה.
            </p>
            <p className="text-slate-500 mb-6 text-sm">
              המנהל צריך לאשר את החשבון לפני שתוכלו למלא זמינות. <strong>שלחו הודעה למנהל</strong> כדי שיאשר אותך —
              עד אז המסך הזה יישאר. ברגע שתאושרו, המערכת תיפתח מעצמה.
            </p>
            <Button onClick={checkAgain} disabled={checking} className="w-full mb-2">
              {checking ? 'בודק...' : 'בדוק שוב'}
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={logout} className="w-full">
          יציאה
        </Button>
      </div>
    </div>
  )
}
