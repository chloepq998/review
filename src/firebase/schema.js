// Firestore 컬렉션 이름 상수 + 문서 shape 정의 (JSDoc typedef) + 기본값 팩토리.
// Firestore는 스키마리스이지만, 클라이언트에서 항상 이 shape을 통해서만 문서를 만들도록 강제한다.

export const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  QUESTIONS: 'questions',
  REVIEW_SCHEDULE: 'reviewSchedule',
}

// 기본 제공 과목 목록 (초기 4과목). subject 필드는 고정 enum이 아니라 자유 문자열이라
// 사용자가 이 외의 과목을 추가로 입력해도 그대로 저장/조회된다 (색상은 subjectColors.js에서 처리).
export const SUBJECTS = ['국어', '수학', '영어', '과학']

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  OX: 'ox',
}

/**
 * @typedef {Object} UserDoc
 * @property {string} name
 * @property {string} email
 * @property {boolean} isPublic
 * @property {boolean} allowAiTraining
 * @property {number} streak
 * @property {import('firebase/firestore').Timestamp | null} lastReviewDate
 * @property {number} skipTokens
 * @property {number} notificationHour  // 0-23, 기본 20시
 */

/** @returns {Omit<UserDoc, 'name' | 'email'>} 회원가입 시 기본값 (동의 항목은 옵트인: 기본 false) */
export function defaultUserDoc() {
  return {
    isPublic: false,
    allowAiTraining: false,
    streak: 0,
    lastReviewDate: null,
    skipTokens: 0,
    notificationHour: 20,
  }
}

/**
 * @typedef {Object} NoteDoc
 * @property {string} userId
 * @property {string} subject
 * @property {string} conceptTag
 * @property {string} rawText
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} QuestionDoc
 * @property {string} noteId
 * @property {string} userId
 * @property {string} subject
 * @property {string} conceptTag
 * @property {'multiple_choice' | 'ox'} type
 * @property {string} questionText
 * @property {string[]} choices
 * @property {string} correctAnswer
 * @property {boolean} isFlagged
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} ReviewScheduleDoc
 * @property {string} userId
 * @property {string} questionId
 * @property {number} correctStreak
 * @property {import('firebase/firestore').Timestamp} nextReviewDate
 * @property {'correct' | 'incorrect' | null} lastResult
 */
