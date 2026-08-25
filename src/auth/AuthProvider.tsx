import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

export type Role = 'employee' | 'manager'
export type Status = 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: Role
  status: Status
}

const BOOTSTRAP_MANAGER_EMAIL = import.meta.env.VITE_BOOTSTRAP_MANAGER_EMAIL as string | undefined

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isManager: boolean
  isApproved: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [profileResolved, setProfileResolved] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setAuthResolved(true)

      if (!firebaseUser) {
        setProfile(null)
        setProfileResolved(true)
        return
      }

      const ref = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? '',
          photoURL: firebaseUser.photoURL ?? '',
          role: 'employee',
          status: 'pending',
          createdAt: serverTimestamp(),
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile({ uid: user.uid, ...(snap.data() as Omit<UserProfile, 'uid'>) })
      }
      setProfileResolved(true)
    })
  }, [user])

  const isBootstrapManager = !!user?.email && user.email === BOOTSTRAP_MANAGER_EMAIL
  const isManager = isBootstrapManager || (profile?.role === 'manager' && profile?.status === 'approved')
  const isApproved = isBootstrapManager || profile?.status === 'approved'

  const login = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const loading = !authResolved || (!!user && !profileResolved)

  return (
    <AuthContext.Provider value={{ user, profile, loading, isManager, isApproved, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
