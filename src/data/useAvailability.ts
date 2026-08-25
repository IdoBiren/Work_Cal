import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthProvider'
import { shiftWeekId } from '../lib/dates'
import { DEFAULT_END, DEFAULT_START } from '../lib/slots'
import type { DayAvailability } from '../lib/coverage'

export type WeekDays = Record<number, DayAvailability>

function emptyWeek(): WeekDays {
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

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const ref = doc(db, 'weeks', weekId, 'availability', user.uid)
    return onSnapshot(ref, (snap) => {
      const data = snap.data()
      setDays(data ? { ...emptyWeek(), ...(data.days as WeekDays) } : emptyWeek())
      setLoading(false)
    })
  }, [user, weekId])

  const persist = async (next: WeekDays) => {
    if (!user) return
    setDays(next)
    setSaving(true)
    try {
      const ref = doc(db, 'weeks', weekId, 'availability', user.uid)
      await setDoc(ref, {
        displayName: profile?.displayName ?? user.displayName ?? '',
        days: next,
        updatedAt: serverTimestamp(),
      })
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
    const ref = doc(db, 'weeks', prevWeekId, 'availability', user.uid)
    const snap = await getDoc(ref)
    const prevDays = snap.data()?.days as WeekDays | undefined
    if (!prevDays || !Object.values(prevDays).some((d) => d.available)) return false

    await persist({ ...emptyWeek(), ...prevDays })
    return true
  }

  return { days, setDay, loading, saving, hasAnyAvailability, copyFromPreviousWeek }
}
