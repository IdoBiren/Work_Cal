import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthProvider'
import { emptyWeek, type WeekDays } from './useAvailability'
import { shiftWeekId, weekIdOf } from '../lib/dates'
import { errorMessage } from '../lib/errors'
import type { DayAvailability } from '../lib/coverage'

const WEEKS_TO_SCAN = 8

/** A fixed employee's permanent weekly schedule, stored on their own user doc — applies to every week automatically. */
export function useFixedSchedule() {
  const { user } = useAuth()
  const [days, setDays] = useState<WeekDays>(emptyWeek())
  const [hasSaved, setHasSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importable, setImportable] = useState<WeekDays | null>(null)

  useEffect(() => {
    if (!user) return
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        const fixedDays = snap.data()?.fixedDays as WeekDays | undefined
        setHasSaved(!!fixedDays)
        setDays(fixedDays ? { ...emptyWeek(), ...fixedDays } : emptyWeek())
        setLoading(false)
      },
      (err) => {
        setError(errorMessage(err, 'טעינת הזמנים הקבועים נכשלה.'))
        setLoading(false)
      },
    )
  }, [user])

  // An employee switched to "fixed" mid-use still has weekly availability saved
  // from before; offer to carry it over instead of starting from an empty form.
  useEffect(() => {
    if (!user || loading || hasSaved) return
    let cancelled = false
    ;(async () => {
      let weekId = weekIdOf(new Date())
      for (let i = 0; i < WEEKS_TO_SCAN; i++) {
        try {
          const snap = await getDoc(doc(db, 'weeks', weekId, 'availability', user.uid))
          const prev = snap.data()?.days as WeekDays | undefined
          if (prev && Object.values(prev).some((d) => d.available)) {
            if (!cancelled) setImportable({ ...emptyWeek(), ...prev })
            return
          }
        } catch {
          return // not worth surfacing; the form still works empty
        }
        weekId = shiftWeekId(weekId, -1)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, loading, hasSaved])

  const write = async (next: WeekDays) => {
    if (!user) return
    const previous = days
    setDays(next)
    setError(null)
    try {
      await updateDoc(doc(db, 'users', user.uid), { fixedDays: next })
    } catch (err) {
      setDays(previous)
      setError(errorMessage(err, 'השמירה נכשלה. השינוי לא נשמר.'))
    }
  }

  const setDay = (weekday: number, value: DayAvailability) => write({ ...days, [weekday]: value })

  const importPrevious = async () => {
    if (!importable) return
    await write(importable)
    setImportable(null)
  }

  return { days, setDay, loading, error, importable, importPrevious }
}
