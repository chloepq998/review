import { Link } from 'react-router-dom'

export default function ReviewPlaceholder() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'var(--font-body)' }}>
      <h1>퀴즈 풀이 화면 준비 중</h1>
      <p>다음 단계에서 사지선다/OX 퀴즈 풀이 화면이 이 자리에 들어갑니다.</p>
      <Link to="/">홈으로 돌아가기</Link>
    </main>
  )
}
