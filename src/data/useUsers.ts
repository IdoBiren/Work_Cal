import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Role, Status } from '../auth/AuthProvider'

export interface UserRow {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: Role
  status: Status
}

export function useUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserRow, 'uid'>) })))
      setLoading(false)
    })
  }, [])

  const setStatus = (uid: string, status: Status) => updateDoc(doc(db, 'users', uid), { status })
  const setRole = (uid: string, role: Role) => updateDoc(doc(db, 'users', uid), { role })

  return { users, loading, setStatus, setRole }
}
