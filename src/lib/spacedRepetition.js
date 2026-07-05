// 단순화된 SM-2 기반 간격 반복 로직.
//
// | correctStreak | 다음 복습까지 간격 |
// | 0 (처음 학습)  | 1일 후             |
// | 1              | 3일 후             |
// | 2              | 7일 후             |
// | 3              | 14일 후            |
// | 4 이상         | 30일 후            |
// | 틀렸을 때      | correctStreak 0으로 리셋, 다음날 재시도 |
//
// OX 문제는 사지선다보다 판별력이 낮아, 정답 시 correctStreak 증가폭을 절반(0.5)으로
// 처리한다. 간격 테이블 조회 시에는 정수로 내림(Math.floor)해서 매핑한다.

export const INTERVAL_DAYS_BY_STREAK = {
  0: 1,
  1: 3,
  2: 7,
  3: 14,
}
export const MAX_INTERVAL_DAYS = 30

export function getInitialReviewSchedule() {
  return {
    correctStreak: 0,
    nextReviewDate: new Date(),
    lastResult: null,
  }
}

export function getIntervalDays(streakLevel) {
  return INTERVAL_DAYS_BY_STREAK[Math.floor(streakLevel)] ?? MAX_INTERVAL_DAYS
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * @param {Object} params
 * @param {number} params.correctStreak 답변 전까지의 correctStreak
 * @param {'multiple_choice' | 'ox'} params.questionType
 * @param {boolean} params.isCorrect
 */
export function computeNextSchedule({ correctStreak, questionType, isCorrect }) {
  if (!isCorrect) {
    return {
      correctStreak: 0,
      nextReviewDate: addDays(new Date(), 1),
      lastResult: 'incorrect',
    }
  }

  const increment = questionType === 'ox' ? 0.5 : 1
  const newStreak = (correctStreak ?? 0) + increment

  return {
    correctStreak: newStreak,
    nextReviewDate: addDays(new Date(), getIntervalDays(newStreak)),
    lastResult: 'correct',
  }
}
