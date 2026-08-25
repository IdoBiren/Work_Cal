import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { EmployeeAvailability } from '../lib/coverage'

export function useWeekAvailability(weekId: string) {
  const [employees, setEmployees] = useState<EmployeeAvailability[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const ref = collection(db, 'weeks', weekId, 'availability')
    return onSnapshot(ref, (snap) => {
      setEmployees(
        snap.docs.map((d) => ({
          uid: d.id,
          displayName: (d.data().displayName as string) ?? 'עובד',
          days: (d.data().days as EmployeeAvailability['days']) ?? {},
        })),
      )
      setLoading(false)
    })
  }, [weekId])

  return { employees, loading }
}
