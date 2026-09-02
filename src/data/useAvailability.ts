import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthProvider'
import { shiftWeekId } from '../lib/dates'
import { DEFAULT_END, DEFAULT_START } from '../lib/slots'
import { errorMessage } from '../lib/errors'
import type { DayAvailability } from '../lib/coverage'

export type WeekDays = Record<number, DayAvailability>

export function emptyWeek(): WeekDays {
  const days: WeekDays = {}
  for (let i = 0; i < 7; i++) {
    days[i] = { available: false, start: DEFAULT_START, end: DEFAULT_END }
  }
  return days
}

export function useAvailability(weekId: string) {
  const { user, profile } = useAuth()
  const [days, setDays] = useState<WeekDays>(emptyWeek())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const ref = doc(db, 'weeks', weekId, 'availability', user.uid)
    return onSnapshot(
      ref,
      (snap) => {
        const data = snap.data()
        setDays(data ? { ...emptyWeek(), ...(data.days as WeekDays) } : emptyWeek())
        setLoading(false)
      },
      (err) => {
        setError(errorMessage(err, 'טעינת הזמינות נכשלה.'))
        setLoading(false)
      },
    )
  }, [user, weekId])

  /** Writes the whole week. On failure the local state is rolled back so the UI never lies about being saved. */
  const persist = async (next: WeekDays) => {
    if (!user) return
    const previous = days
    setDays(next)
    setSaving(true)
    setError(null)
    try {
      const ref = doc(db, 'weeks', weekId, 'availability', user.uid)
      await setDoc(ref, {
        displayName: profile?.displayName ?? user.displayName ?? '',
        days: next,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      setDays(previous)
      setError(errorMessage(err, 'השמירה נכשלה. הסימון לא נשמר.'))
    } finally {
      setSaving(false)
    }
  }

  const setDay = (weekday: number, value: DayAvailability) => persist({ ...days, [weekday]: value })

  const hasAnyAvailability = Object.values(days).some((d) => d.available)

  /** Copies the availability of the week right before `weekId` into it. Returns whether there was anything to copy. */
  const copyFromPreviousWeek = async (): Promise<boolean> => {
    if (!user) return false
    const prevWeekId = shiftWeekId(weekId, -1)
    try {
      const ref = doc(db, 'weeks', prevWeekId, 'availability', user.uid)
      const snap = await getDoc(ref)
      const prevDays = snap.data()?.days as WeekDays | undefined
      if (!prevDays || !Object.values(prevDays).some((d) => d.available)) return false

      await persist({ ...emptyWeek(), ...prevDays })
      return true
    } catch (err) {
      setError(errorMessage(err, 'ההעתקה מהשבוע הקודם נכשלה.'))
      return false
    }
  }

  return { days, setDay, loading, saving, error, hasAnyAvailability, copyFromPreviousWeek }
}
