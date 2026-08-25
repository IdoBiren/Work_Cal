import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthProvider'
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

  const setDay = async (weekday: number, value: DayAvailability) => {
    if (!user) return
    const next = { ...days, [weekday]: value }
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

  return { days, setDay, loading, saving }
}
