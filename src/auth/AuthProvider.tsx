import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'
import { errorMessage } from '../lib/errors'

export type Role = 'employee' | 'manager'
export type Status = 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: Role
  status: Status
  isFixedSchedule?: boolean
}

const BOOTSTRAP_MANAGER_EMAIL = import.meta.env.VITE_BOOTSTRAP_MANAGER_EMAIL as string | undefined

/**
 * Popup sign-in is unreliable on phones and outright blocked inside embedded
 * browsers (WhatsApp/Instagram/Facebook), which is how a shared link is usually
 * opened. Those get the redirect flow instead.
 */
function prefersRedirectFlow(): boolean {
  const ua = navigator.userAgent || ''
  const isEmbedded = /FBAN|FBAV|Instagram|Line|WhatsApp|wv\)/i.test(ua)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua)
  return isEmbedded || isMobile
}

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  needsProfile: boolean
  isManager: boolean
  isApproved: boolean
  authError: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  completeProfile: (displayName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [profileResolved, setProfileResolved] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Surfaces failures from the redirect flow, which land on page load rather
  // than in the login click handler.
  useEffect(() => {
    getRedirectResult(auth).catch((err) => setAuthError(errorMessage(err, 'ההתחברות נכשלה.')))
  }, [])

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)
        setAuthResolved(true)
        if (!firebaseUser) {
          setProfile(null)
          setProfileResolved(true)
        }
      },
      (err) => {
        setAuthError(errorMessage(err, 'ההתחברות נכשלה.'))
        setAuthResolved(true)
        setProfileResolved(true)
      },
    )
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile({ uid: user.uid, ...(snap.data() as Omit<UserProfile, 'uid'>) })
        }
        setProfileResolved(true)
      },
      (err) => {
        // Never leave the app spinning forever on a failed read.
        setAuthError(errorMessage(err, 'טעינת הפרופיל נכשלה.'))
        setProfileResolved(true)
      },
    )
  }, [user])

  const isBootstrapManager =
    !!user?.email && !!BOOTSTRAP_MANAGER_EMAIL && user.email.toLowerCase() === BOOTSTRAP_MANAGER_EMAIL.toLowerCase()
  const isManager = isBootstrapManager || (profile?.role === 'manager' && profile?.status === 'approved')
  const isApproved = isBootstrapManager || profile?.status === 'approved'

  const loading = !authResolved || (!!user && !profileResolved)
  const needsProfile = !loading && !!user && !profile

  const login = async () => {
    setAuthError(null)
    if (prefersRedirectFlow()) {
      await signInWithRedirect(auth, googleProvider)
      return
    }
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string })?.code
      // A blocked popup is recoverable — fall back to redirect instead of dead-ending.
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      throw err
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const completeProfile = async (displayName: string) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, {
      email: user.email ?? '',
      displayName,
      photoURL: user.photoURL ?? '',
      role: 'employee',
      status: 'pending',
      createdAt: serverTimestamp(),
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsProfile,
        isManager,
        isApproved,
        authError,
        login,
        logout,
        completeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
