// 오늘 복습해야 할 전체 개수를 세션 동안 기억해서 진행률(완료/전체)을 계산한다.
// 문제를 풀면 reviewSchedule의 nextReviewDate가 미래로 밀려나 "오늘 남은 개수"가 줄어드는데,
// 그 변화만으로는 전체 대비 완료 개수를 알 수 없어 세션 스토리지에 하루치 총량을 기록해둔다.

const STORAGE_PREFIX = 'reviewTotal:'

function todayKey() {
  return STORAGE_PREFIX + new Date().toDateString()
}

export function getTodayTotal(remainingCount) {
  if (typeof window === 'undefined') return remainingCount

  const key = todayKey()
  const stored = Number(window.sessionStorage.getItem(key))
  const total = Math.max(Number.isFinite(stored) ? stored : 0, remainingCount)
  window.sessionStorage.setItem(key, String(total))
  return total
}
