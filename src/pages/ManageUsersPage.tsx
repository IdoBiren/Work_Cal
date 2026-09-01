import Layout from '../components/ui/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useUsers } from '../data/useUsers'

const statusLabel: Record<string, string> = {
  pending: 'ממתין לאישור',
  approved: 'מאושר',
  rejected: 'נדחה',
}

export default function ManageUsersPage() {
  const { users, loading, setStatus, setRole, setFixedSchedule } = useUsers()

  if (loading) return <Layout><Spinner /></Layout>

  const pending = users.filter((u) => u.status === 'pending')
  const others = users.filter((u) => u.status !== 'pending')

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <h2 className="font-bold text-slate-800 mb-3">ממתינים לאישור</h2>
          {pending.length === 0 ? (
            <EmptyState message="אין עובדים ממתינים" />
          ) : (
            <ul className="space-y-2">
              {pending.map((u) => (
                <li key={u.uid} className="flex flex-wrap items-center justify-between gap-2 py-1">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{u.displayName}</div>
                    <div className="text-xs text-slate-400 truncate">{u.email}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button onClick={() => setStatus(u.uid, 'approved')}>אישור</Button>
                    <Button variant="danger" onClick={() => setStatus(u.uid, 'rejected')}>
                      דחייה
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-bold text-slate-800 mb-3">כל העובדים</h2>
          <ul className="space-y-2">
            {others.map((u) => (
              <li key={u.uid} className="flex flex-wrap items-center justify-between gap-2 py-1">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{u.displayName}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {u.email} · {statusLabel[u.status]} · {u.role === 'manager' ? 'מנהל' : 'עובד'}
                    {u.isFixedSchedule ? ' · קבוע' : ''}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {u.status === 'approved' && u.role === 'employee' && (
                    <Button variant="secondary" onClick={() => setRole(u.uid, 'manager')}>
                      הפוך למנהל
                    </Button>
                  )}
                  {u.status === 'approved' && u.role === 'manager' && (
                    <Button variant="secondary" onClick={() => setRole(u.uid, 'employee')}>
                      הסר הרשאת מנהל
                    </Button>
                  )}
                  {u.status === 'approved' && !u.isFixedSchedule && (
                    <Button variant="secondary" onClick={() => setFixedSchedule(u.uid, true)}>
                      הפוך לעובד קבוע
                    </Button>
                  )}
                  {u.status === 'approved' && u.isFixedSchedule && (
                    <Button variant="secondary" onClick={() => setFixedSchedule(u.uid, false)}>
                      הסר סטטוס קבוע
                    </Button>
                  )}
                  {u.status === 'rejected' && (
                    <Button onClick={() => setStatus(u.uid, 'approved')}>אישור</Button>
                  )}
                  {u.status === 'approved' && (
                    <Button variant="danger" onClick={() => setStatus(u.uid, 'rejected')}>
                      חסימה
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Layout>
  )
}
