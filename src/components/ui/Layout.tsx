import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import Button from './Button'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium text-center whitespace-nowrap ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function Layout({ children }: { children: ReactNode }) {
  const { profile, isManager, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="font-bold text-lg text-slate-800 shrink-0">סידור עבודה</h1>
          <Button variant="ghost" onClick={logout} className="text-xs min-w-0">
            <span className="block truncate">{profile?.displayName ?? ''} · יציאה</span>
          </Button>
        </div>
        <nav className="max-w-3xl mx-auto px-4 pb-2 grid grid-cols-2 gap-2 sm:flex">
          <NavLink to="/" end className={linkClass}>
            {profile?.isFixedSchedule ? 'הזמנים הקבועים שלי' : 'הזמינות שלי'}
          </NavLink>
          {isManager && (
            <>
              <NavLink to="/summary" className={linkClass}>
                סיכום שבועי
              </NavLink>
              <NavLink to="/requirements" className={linkClass}>
                דרישות כיסוי
              </NavLink>
              <NavLink to="/users" className={linkClass}>
                ניהול עובדים
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4">{children}</main>
    </div>
  )
}
