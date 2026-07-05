// 과목별 포스트잇 탭 색상. 국어/수학/영어/과학은 고정 색을 쓰고,
// 앞으로 과목이 계속 늘어날 것을 감안해 그 외 과목은 이름을 해시해서
// 아래 팔레트 중 하나로 안정적으로(같은 이름은 항상 같은 색) 매핑한다.

const FIXED_SUBJECT_COLORS = {
  국어: '#F2A6A0',
  수학: '#A8C8E8',
  영어: '#F5D98A',
  과학: '#B6D9AE',
}

const FALLBACK_PALETTE = [
  '#D8B4E2',
  '#F7C59F',
  '#9AD1D4',
  '#CBBE8A',
  '#E8A0BF',
  '#9FB8E0',
  '#B5EAD7',
  '#F6B89C',
]

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getSubjectColor(subject) {
  if (FIXED_SUBJECT_COLORS[subject]) return FIXED_SUBJECT_COLORS[subject]
  if (!subject) return FALLBACK_PALETTE[0]
  return FALLBACK_PALETTE[hashString(subject) % FALLBACK_PALETTE.length]
}
