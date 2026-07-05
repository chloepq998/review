import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../firebase/schema'
import { getInitialReviewSchedule } from '../lib/spacedRepetition'

const MAX_QUESTIONS_PER_NOTE = 5

/**
 * 필기를 저장하고, 이미 생성된 문제가 없으면 AI 문제 생성을 요청해 Firestore에 캐싱한다.
 * 각 문제에는 오늘부터 바로 복습 가능한 초기 reviewSchedule을 함께 만든다.
 */
export async function createNoteAndGenerateQuestions({ userId, subject, conceptTag, rawText }) {
  const noteRef = await addDoc(collection(db, COLLECTIONS.NOTES), {
    userId,
    subject,
    conceptTag,
    rawText,
    createdAt: serverTimestamp(),
  })

  const cached = await getDocs(
    query(collection(db, COLLECTIONS.QUESTIONS), where('noteId', '==', noteRef.id)),
  )
  if (!cached.empty) {
    return { noteId: noteRef.id, questions: cached.docs.map((d) => ({ id: d.id, ...d.data() })) }
  }

  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, subject, conceptTag, count: MAX_QUESTIONS_PER_NOTE }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || '문제 생성에 실패했습니다.')
  }

  const { questions } = await response.json()

  const created = await Promise.all(
    questions.map((generated) => saveGeneratedQuestion({ noteRef, userId, subject, conceptTag, generated })),
  )

  return { noteId: noteRef.id, questions: created }
}

async function saveGeneratedQuestion({ noteRef, userId, subject, conceptTag, generated }) {
  const questionRef = await addDoc(collection(db, COLLECTIONS.QUESTIONS), {
    noteId: noteRef.id,
    userId,
    subject,
    conceptTag: generated.conceptTag || conceptTag,
    type: generated.type,
    questionText: generated.questionText,
    choices: generated.type === 'multiple_choice' ? generated.choices : [],
    correctAnswer: generated.correctAnswer,
    isFlagged: false,
    isActive: true,
    needsReview: Boolean(generated.needsHumanReview),
  })

  await setDoc(doc(db, COLLECTIONS.REVIEW_SCHEDULE, questionRef.id), {
    userId,
    questionId: questionRef.id,
    ...getInitialReviewSchedule(),
  })

  return { id: questionRef.id }
}
