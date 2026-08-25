import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { SLOT_COUNT } from '../lib/slots'
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

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'coverageTemplate'), (snap) => {
      const data = snap.data()
      setTemplate(data ? { ...emptyTemplate(), ...(data.byWeekday as WeekdayRequirements) } : emptyTemplate())
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    return onSnapshot(doc(db, 'weeks', weekId), (snap) => {
      const data = snap.data()
      setOverride(data?.requirementsOverride ? (data.requirementsOverride as WeekdayRequirements) : null)
      setLoading(false)
    })
  }, [weekId])

  const effective = override ?? template

  const saveTemplate = async (next: WeekdayRequirements) => {
    setTemplate(next)
    await setDoc(doc(db, 'settings', 'coverageTemplate'), { byWeekday: next })
  }

  const saveOverride = async (next: WeekdayRequirements | null) => {
    setOverride(next)
    await setDoc(doc(db, 'weeks', weekId), { requirementsOverride: next }, { merge: true })
  }

  return { template, override, effective, saveTemplate, saveOverride, loading }
}
