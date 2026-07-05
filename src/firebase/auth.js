import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'
import { COLLECTIONS, defaultUserDoc } from './schema'

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password
 * @param {boolean} params.isPublic 필기 공개 여부 동의
 * @param {boolean} params.allowAiTraining AI 학습 활용 허용 여부 동의
 */
export async function signUp({ name, email, password, isPublic, allowAiTraining }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })

  await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
    ...defaultUserDoc(),
    name,
    email,
    isPublic: !!isPublic,
    allowAiTraining: !!allowAiTraining,
    createdAt: serverTimestamp(),
  })

  return credential.user
}

export async function logIn({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export function logOut() {
  return signOut(auth)
}
