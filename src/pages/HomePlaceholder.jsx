import { useAuth } from '../context/AuthContext'
import { logOut } from '../firebase/auth'

export default function HomePlaceholder() {
  const { user, userDoc } = useAuth()

  return (
    <main style={{ padding: '2rem', fontFamily: 'var(--font-body)' }}>
      <h1>복습 수첩</h1>
      <p>{userDoc?.name ?? user?.email}님, 환영합니다.</p>
      <p>공개 여부: {userDoc?.isPublic ? '공개' : '비공개'} / AI 학습 허용: {userDoc?.allowAiTraining ? '허용' : '비허용'}</p>
      <p>다음 단계에서 오늘의 복습 홈 화면이 이 자리에 들어갑니다.</p>
      <button onClick={() => logOut()}>로그아웃</button>
    </main>
  )
}
