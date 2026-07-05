import { doc, updateDoc, increment, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../firebase/schema'
import { computeNextSchedule } from '../lib/spacedRepetition'

const SKIP_TOKEN_GRANT_INTERVAL_DAYS = 7

function toDate(value) {
  if (!value) return null
  return value.toDate ? value.toDate() : new Date(value)
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

/** 문제 하나에 답한 결과를 reviewSchedule에 반영한다. */
export async function submitAnswer({ scheduleId, correctStreak, questionType, isCorrect }) {
  const next = computeNextSchedule({ correctStreak, questionType, isCorrect })
  await updateDoc(doc(db, COLLECTIONS.REVIEW_SCHEDULE, scheduleId), next)
  return next
}

/** 복습을 하루 이상 완전히 건너뛰었으면 스트릭을 리셋한다 (홈 화면 진입 시 호출). */
export async function applyStreakMaintenance({ userId, userDoc }) {
  const lastReviewDate = toDate(userDoc?.lastReviewDate)
  if (!lastReviewDate || !userDoc?.streak) return

  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(lastReviewDate)) / (24 * 60 * 60 * 1000),
  )
  if (diffDays >= 2) {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), { streak: 0 })
  }
}

/** 오늘 분량 복습을 모두 마쳤을 때 호출: 스트릭 +1, 오늘 복습 완료로 기록. */
export async function markTodayReviewed({ userId, userDoc }) {
  const lastReviewDate = toDate(userDoc?.lastReviewDate)
  if (lastReviewDate && isSameDay(lastReviewDate, new Date())) return

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    streak: increment(1),
    lastReviewDate: new Date(),
  })
}

/** 일정 주기(기본 7일)마다 스킵권을 자동 지급한다 (홈 화면 진입 시 호출). */
export async function grantWeeklySkipTokenIfDue({ userId, userDoc }) {
  const last = toDate(userDoc?.lastSkipTokenGrantAt)
  if (last) {
    const diffDays = (Date.now() - last.getTime()) / (24 * 60 * 60 * 1000)
    if (diffDays < SKIP_TOKEN_GRANT_INTERVAL_DAYS) return
  }

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    skipTokens: increment(1),
    lastSkipTokenGrantAt: new Date(),
  })
}

/**
 * 스킵권 사용: 오늘 마감된 복습 항목을 전부 내일로 미루고, 스트릭은 유지(오늘 완료한 것처럼 처리)한다.
 * @returns {Promise<boolean>} 사용에 성공했으면 true
 */
export async function consumeSkipToken({ userId, userDoc, todayScheduleItems }) {
  if ((userDoc?.skipTokens ?? 0) <= 0) return false

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const batch = writeBatch(db)
  todayScheduleItems.forEach((item) => {
    batch.update(doc(db, COLLECTIONS.REVIEW_SCHEDULE, item.id), { nextReviewDate: tomorrow })
  })
  batch.update(doc(db, COLLECTIONS.USERS, userId), {
    skipTokens: increment(-1),
    streak: increment(1),
    lastReviewDate: new Date(),
  })

  await batch.commit()
  return true
}
