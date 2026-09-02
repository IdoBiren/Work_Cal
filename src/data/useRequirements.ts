import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { SLOT_COUNT } from '../lib/slots'
import { errorMessage } from '../lib/errors'
import type { WeekdayRequirements } from '../lib/coverage'

function emptyTemplate(): WeekdayRequirements {
  const t: WeekdayRequirements = {}
  for (let i = 0; i < 7; i++) t[i] = Array(SLOT_COUNT).fill(0)
  return t
}

/** Effective requirements for a week: the per-week override merged over the default template. */
export function useRequirements(weekId: string) {
  const [template, setTemplate] = useState<WeekdayRequirements>(emptyTemplate())
  const [override, setOverride] = useState<WeekdayRequirements | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onSnapshot(
      doc(db, 'settings', 'coverageTemplate'),
      (snap) => {
        const data = snap.data()
        setTemplate(data ? { ...emptyTemplate(), ...(data.byWeekday as WeekdayRequirements) } : emptyTemplate())
      },
      (err) => setError(errorMessage(err, 'טעינת תבנית הכיסוי נכשלה.')),
    )
  }, [])

  useEffect(() => {
    setLoading(true)
    return onSnapshot(
      doc(db, 'weeks', weekId),
      (snap) => {
        const data = snap.data()
        setOverride(data?.requirementsOverride ? (data.requirementsOverride as WeekdayRequirements) : null)
        setLoading(false)
      },
      (err) => {
        setError(errorMessage(err, 'טעינת דרישות השבוע נכשלה.'))
        setLoading(false)
      },
    )
  }, [weekId])

  const effective = override ?? template

  const saveTemplate = async (next: WeekdayRequirements) => {
    const previous = template
    setTemplate(next)
    setError(null)
    try {
      await setDoc(doc(db, 'settings', 'coverageTemplate'), { byWeekday: next })
    } catch (err) {
      setTemplate(previous)
      setError(errorMessage(err, 'שמירת התבנית נכשלה.'))
    }
  }

  const saveOverride = async (next: WeekdayRequirements | null) => {
    const previous = override
    setOverride(next)
    setError(null)
    try {
      await setDoc(doc(db, 'weeks', weekId), { requirementsOverride: next }, { merge: true })
    } catch (err) {
      setOverride(previous)
      setError(errorMessage(err, 'שמירת הדרישות לשבוע נכשלה.'))
    }
  }

  return { template, override, effective, saveTemplate, saveOverride, loading, error }
}
