import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthProvider'
import { emptyWeek, type WeekDays } from './useAvailability'
import type { DayAvailability } from '../lib/coverage'

/** A fixed employee's permanent weekly schedule, stored on their own user doc — applies to every week automatically. */
export function useFixedSchedule() {
  const { user } = useAuth()
  const [days, setDays] = useState<WeekDays>(emptyWeek())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const fixedDays = snap.data()?.fixedDays as WeekDays | undefined
      setDays(fixedDays ? { ...emptyWeek(), ...fixedDays } : emptyWeek())
      setLoading(false)
    })
  }, [user])

  const setDay = async (weekday: number, value: DayAvailability) => {
    if (!user) return
    const next = { ...days, [weekday]: value }
    setDays(next)
    await updateDoc(doc(db, 'users', user.uid), { fixedDays: next })
  }

  return { days, setDay, loading }
}
