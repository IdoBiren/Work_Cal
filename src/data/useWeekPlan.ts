import { useEffect, useState } from 'react'
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { errorMessage } from '../lib/errors'

/** A one-off person added by a manager to a single day of a single week (e.g. a substitute). */
export interface ExtraShift {
  id: string
  displayName: string
  weekday: number
  start: string
  end: string
}

/** Manager decisions stored on the week doc: which account-less staff confirmed, and one-off additions. */
export function useWeekPlan(weekId: string) {
  const [confirmedStaff, setConfirmedStaff] = useState<string[]>([])
  const [extraShifts, setExtraShifts] = useState<ExtraShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    return onSnapshot(
      doc(db, 'weeks', weekId),
      (snap) => {
        const data = snap.data()
        setConfirmedStaff((data?.confirmedStaff as string[]) ?? [])
        setExtraShifts((data?.extraShifts as ExtraShift[]) ?? [])
        setLoading(false)
      },
      (err) => {
        setError(errorMessage(err, 'טעינת נתוני השבוע נכשלה.'))
        setLoading(false)
      },
    )
  }, [weekId])

  const write = async (fields: Record<string, unknown>, fallback: string) => {
    setError(null)
    try {
      await setDoc(doc(db, 'weeks', weekId), fields, { merge: true })
    } catch (err) {
      setError(errorMessage(err, fallback))
    }
  }

  const toggleConfirmed = (staffId: string) =>
    write(
      { confirmedStaff: confirmedStaff.includes(staffId) ? arrayRemove(staffId) : arrayUnion(staffId) },
      'עדכון האישור נכשל.',
    )

  const addExtra = (extra: Omit<ExtraShift, 'id'>) =>
    write({ extraShifts: arrayUnion({ ...extra, id: crypto.randomUUID() }) }, 'הוספת העובד ליום נכשלה.')

  const removeExtra = (extra: ExtraShift) => write({ extraShifts: arrayRemove(extra) }, 'הסרת העובד מהיום נכשלה.')

  return { confirmedStaff, extraShifts, loading, error, toggleConfirmed, addExtra, removeExtra }
}
