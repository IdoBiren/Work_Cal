import { useState, type FormEvent } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'
import ErrorNote from './ui/ErrorNote'
import DayAvailabilityRow from './DayAvailabilityRow'
import { useStaff } from '../data/useStaff'
import { WORKDAYS } from '../lib/dates'

/** Manager card for fixed employees who have no app account: add, set their fixed days, rename, delete. */
export default function StaffManager() {
  const { staff, loading, error, addStaff, setStaffDay, renameStaff, removeStaff } = useStaff()
  const [newName, setNewName] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    await addStaff(name)
    setNewName('')
  }

  const rename = (id: string, current: string) => {
    const name = window.prompt('שם חדש:', current)?.trim()
    if (name && name !== current) renameStaff(id, name)
  }

  const remove = (id: string, name: string) => {
    if (window.confirm(`למחוק את ${name}? הוא יוסר מכל השבועות.`)) removeStaff(id)
  }

  return (
    <Card>
      <h2 className="font-bold text-slate-800 mb-1">עובדים קבועים ללא משתמש</h2>
      <p className="text-xs text-slate-500 mb-3">
        עובדים שלא נכנסים לאפליקציה. הגדירו את הימים הקבועים שלהם, ובכל שבוע סמנו בסיכום השבועי מי אישר הגעה.
      </p>
      <ErrorNote message={error} />

      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="שם העובד"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-0 flex-1"
        />
        <Button type="submit" disabled={!newName.trim()}>
          הוסף עובד קבוע
        </Button>
      </form>

      {loading ? null : staff.length === 0 ? (
        <EmptyState message="אין עובדים קבועים ללא משתמש" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {staff.map((member) => {
            const isOpen = openId === member.id
            return (
              <li key={member.id} className="py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">{member.displayName}</span>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" onClick={() => setOpenId(isOpen ? null : member.id)}>
                      {isOpen ? 'סגור' : 'ימים קבועים'}
                    </Button>
                    <Button variant="ghost" onClick={() => rename(member.id, member.displayName)}>
                      שינוי שם
                    </Button>
                    <Button variant="danger" onClick={() => remove(member.id, member.displayName)}>
                      מחיקה
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-2">
                    {WORKDAYS.map((weekday) => (
                      <DayAvailabilityRow
                        key={weekday}
                        weekday={weekday}
                        value={member.days[weekday]}
                        onChange={(value) => setStaffDay(member, weekday, value)}
                      />
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
