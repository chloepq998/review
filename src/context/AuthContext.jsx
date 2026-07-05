import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { COLLECTIONS } from '../firebase/schema'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribeAuth
  }, [])

  useEffect(() => {
    if (!user) {
      setUserDoc(null)
      return
    }
    const unsubscribeDoc = onSnapshot(
      doc(db, COLLECTIONS.USERS, user.uid),
      (snapshot) => setUserDoc(snapshot.exists() ? snapshot.data() : null),
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
