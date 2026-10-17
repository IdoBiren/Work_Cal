import { useEffect, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { errorMessage } from '../lib/errors'
import { shiftWeekId, weekIdOf } from '../lib/dates'
import type { Role, Status } from '../auth/AuthProvider'

// Availability docs keep a copy of the name; a rename refreshes it in this window of weeks around today.
const RENAME_WEEKS_BACK = 8
const RENAME_WEEKS_AHEAD = 4

async function renameInRecentWeeks(uid: string, displayName: string) {
  const current = weekIdOf(new Date())
  for (let offset = -RENAME_WEEKS_BACK; offset <= RENAME_WEEKS_AHEAD; offset++) {
    const ref = doc(db, 'weeks', shiftWeekId(current, offset), 'availability', uid)
    const snap = await getDoc(ref)
    if (snap.exists() && snap.data().displayName !== displayName) await updateDoc(ref, { displayName })
  }
}

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

  const renameUser = (uid: string, displayName: string) =>
    run(
      (async () => {
        await updateDoc(doc(db, 'users', uid), { displayName })
        await renameInRecentWeeks(uid, displayName)
      })(),
      'שינוי השם נכשל.',
    )

  return { users, loading, error, setStatus, setRole, setFixedSchedule, renameUser }
}
