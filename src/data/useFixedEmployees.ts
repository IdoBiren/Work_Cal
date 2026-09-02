import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { errorMessage } from '../lib/errors'
import type { EmployeeAvailability } from '../lib/coverage'

/** Approved employees with a fixed (recurring) schedule — counted automatically in every week's coverage. */
export function useFixedEmployees() {
  const [employees, setEmployees] = useState<EmployeeAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'users'), where('isFixedSchedule', '==', true), where('status', '==', 'approved'))
    return onSnapshot(
      q,
      (snap) => {
        setEmployees(
          snap.docs.map((d) => ({
            uid: d.id,
            displayName: (d.data().displayName as string) ?? 'עובד',
            days: (d.data().fixedDays as EmployeeAvailability['days']) ?? {},
          })),
        )
        setLoading(false)
      },
      (err) => {
        setError(errorMessage(err, 'טעינת העובדים הקבועים נכשלה.'))
        setLoading(false)
      },
    )
  }, [])

  return { employees, loading, error }
}
