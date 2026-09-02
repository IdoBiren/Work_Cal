import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { errorMessage } from '../lib/errors'
import type { Role, Status } from '../auth/AuthProvider'

export interface UserRow {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: Role
  status: Status
  isFixedSchedule?: boolean
}

export function useUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserRow, 'uid'>) })))
        setLoading(false)
      },
      (err) => {
        setError(errorMessage(err, 'טעינת רשימת העובדים נכשלה.'))
        setLoading(false)
      },
    )
  }, [])

  const run = async (action: Promise<void>, fallback: string) => {
    setError(null)
    try {
      await action
    } catch (err) {
      setError(errorMessage(err, fallback))
    }
  }

  const setStatus = (uid: string, status: Status) =>
    run(updateDoc(doc(db, 'users', uid), { status }), 'עדכון הסטטוס נכשל.')
  const setRole = (uid: string, role: Role) => run(updateDoc(doc(db, 'users', uid), { role }), 'עדכון התפקיד נכשל.')
  const setFixedSchedule = (uid: string, isFixedSchedule: boolean) =>
    run(updateDoc(doc(db, 'users', uid), { isFixedSchedule }), 'עדכון סטטוס "קבוע" נכשל.')

  return { users, loading, error, setStatus, setRole, setFixedSchedule }
}
