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

const REDIRECT_PENDING_KEY = 'work_cal_pending_redirect_login'

/**
 * signInWithPopup works fine on regular mobile Safari/Chrome — only genuinely
 * embedded in-app browsers (WhatsApp/Instagram/Facebook) block it outright.
 * Redirect is reserved for those, since it has its own failure mode: our
 * authDomain (work-cal-a4d58.firebaseapp.com) differs from the hosting domain
 * (work-cal-a4d58.web.app), and browsers that partition storage per top-level
 * site (Safari ITP, some Android browsers) can lose the pending-redirect state
 * across that domain hop — which looks like an infinite "sign in again" loop.
 */
function isEmbeddedBrowser(): boolean {
  const ua = navigator.userAgent || ''
  return /FBAN|FBAV|Instagram|Line|WhatsApp|wv\)/i.test(ua)
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
  // than in the login click handler. Also detects the case where the redirect
  // silently lost its state (see isEmbeddedBrowser's comment) — getRedirectResult
  // resolves to null instead of throwing, so a stuck loop looks like nothing
  // happened rather than an error.
  useEffect(() => {
    const wasPending = sessionStorage.getItem(REDIRECT_PENDING_KEY) === '1'
    getRedirectResult(auth)
      .then((result) => {
        sessionStorage.removeItem(REDIRECT_PENDING_KEY)
        if (wasPending && !result && !auth.currentUser) {
          setAuthError(
            'ההתחברות לא הושלמה — ככל הנראה הדפדפן חוסם שמירת מידע בין אתרים. פתחו את הקישור ישירות ב-Chrome או Safari (לא מתוך אפליקציה אחרת כמו וואטסאפ).',
          )
        }
      })
      .catch((err) => {
        sessionStorage.removeItem(REDIRECT_PENDING_KEY)
        setAuthError(errorMessage(err, 'ההתחברות נכשלה.'))
      })
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

  const redirectLogin = async () => {
    sessionStorage.setItem(REDIRECT_PENDING_KEY, '1')
    await signInWithRedirect(auth, googleProvider)
  }

  const login = async () => {
    setAuthError(null)
    if (isEmbeddedBrowser()) {
      await redirectLogin()
      return
    }
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string })?.code
      // A blocked popup is recoverable — fall back to redirect instead of dead-ending.
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await redirectLogin()
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
