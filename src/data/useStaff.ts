import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { errorMessage } from '../lib/errors'
import { emptyWeek, type WeekDays } from './useAvailability'
import type { DayAvailability } from '../lib/coverage'

/** A fixed employee without an app account, managed entirely by managers. */
export interface StaffMember {
  id: string
  displayName: string
  days: WeekDays
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onSnapshot(
      collection(db, 'staff'),
      (snap) => {
        setStaff(
          snap.docs
            .map((d) => ({
              id: d.id,
              displayName: (d.data().displayName as string) ?? 'עובד',
              days: { ...emptyWeek(), ...((d.data().days as WeekDays) ?? {}) },
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName, 'he')),
        )
        setLoading(false)
      },
      (err) => {
        setError(errorMessage(err, 'טעינת העובדים הקבועים נכשלה.'))
        setLoading(false)
      },
    )
  }, [])

  const run = async (action: Promise<unknown>, fallback: string) => {
    setError(null)
    try {
      await action
    } catch (err) {
      setError(errorMessage(err, fallback))
    }
  }

  const addStaff = (displayName: string) =>
    run(addDoc(collection(db, 'staff'), { displayName, days: emptyWeek(), createdAt: serverTimestamp() }), 'הוספת העובד נכשלה.')

  const setStaffDay = (member: StaffMember, weekday: number, value: DayAvailability) =>
    run(updateDoc(doc(db, 'staff', member.id), { days: { ...member.days, [weekday]: value } }), 'השמירה נכשלה. השינוי לא נשמר.')

  const renameStaff = (id: string, displayName: string) =>
    run(updateDoc(doc(db, 'staff', id), { displayName }), 'שינוי השם נכשל.')

  const removeStaff = (id: string) => run(deleteDoc(doc(db, 'staff', id)), 'מחיקת העובד נכשלה.')

  return { staff, loading, error, addStaff, setStaffDay, renameStaff, removeStaff }
}
