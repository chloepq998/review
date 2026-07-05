import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// .env가 채워지기 전에는 Firebase SDK가 초기화 과정에서 바로 예외를 던지므로,
// 설정이 비어있는 동안은 앱 전체가 크래시하지 않도록 초기화를 건너뛴다.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = isFirebaseConfigured ? getAuth(app) : null
export const db = isFirebaseConfigured ? getFirestore(app) : null
