// 단순화된 SM-2 기반 간격 반복 테이블. 정답 후 업데이트 로직(computeNextSchedule)은
// 퀴즈 풀이 화면과 함께 다음 단계에서 구현한다. 여기서는 새로 생성된 문제의 최초
// 스케줄만 만든다 — 새 문제는 생성 즉시 "오늘"의 복습 대상으로 노출된다.

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
