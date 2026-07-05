import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'
import { COLLECTIONS, defaultUserDoc } from './schema'

// Firebase Auth의 이메일/비밀번호 로그인만 그대로 활용하되, 화면에는 학번만 보이도록
// 학번을 내부용 가짜 이메일로 변환해서 사용한다 (실제 메일함이 없으므로 비밀번호 찾기는 지원 안 됨).
const STUDENT_EMAIL_DOMAIN = 'student.review-notebook.local'

function toStudentEmail(studentId) {
  return `${studentId.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`
}

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.studentId 학번
 * @param {string} params.password
 * @param {boolean} params.isPublic 필기 공개 여부 동의
 * @param {boolean} params.allowAiTraining AI 학습 활용 허용 여부 동의
 */
export async function signUp({ name, studentId, password, isPublic, allowAiTraining }) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    toStudentEmail(studentId),
    password,
  )
  await updateProfile(credential.user, { displayName: name })

  await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
    ...defaultUserDoc(),
    name,
    studentId: studentId.trim(),
    isPublic: !!isPublic,
    allowAiTraining: !!allowAiTraining,
    createdAt: serverTimestamp(),
    lastSkipTokenGrantAt: serverTimestamp(),
  })

  return credential.user
}

export async function logIn({ studentId, password }) {
  const credential = await signInWithEmailAndPassword(auth, toStudentEmail(studentId), password)
  return credential.user
}

export function logOut() {
  return signOut(auth)
}
