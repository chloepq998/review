import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { COLLECTIONS, defaultUserDoc } from '../firebase/schema'
import { AUTO_ANONYMOUS_LOGIN } from '../config/authMode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (!firebaseUser && AUTO_ANONYMOUS_LOGIN) {
        signInAnonymously(auth).catch(() => {})
      }
    })
    return unsubscribeAuth
  }, [])

  useEffect(() => {
    if (!user) {
      setUserDoc(null)
      return undefined
    }
    const ref = doc(db, COLLECTIONS.USERS, user.uid)
    const unsubscribeDoc = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserDoc(snapshot.data())
        } else if (user.isAnonymous) {
          setDoc(ref, {
            ...defaultUserDoc(),
            name: '게스트',
            studentId: null,
            createdAt: serverTimestamp(),
            lastSkipTokenGrantAt: serverTimestamp(),
          }).catch(() => {})
        } else {
          setUserDoc(null)
        }
      },
      () => setUserDoc(null),
    )
    return unsubscribeDoc
  }, [user])

  return (
    <AuthContext.Provider value={{ user, userDoc, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  }
  return context
}
