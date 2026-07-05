import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logOut } from '../firebase/auth'
import { useTodayReview } from '../hooks/useTodayReview'
import StreakStamp from '../components/StreakStamp'
import ProgressBar from '../components/ProgressBar'
import SubjectTab from '../components/SubjectTab'
import '../styles/home.css'

function isToday(timestamp) {
  if (!timestamp) return false
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toDateString() === new Date().toDateString()
}

export default function HomePage() {
  const { user, userDoc } = useAuth()
  const { items, loading } = useTodayReview()

  const total = items.length
  // 문제 풀이(제출) 화면은 다음 단계에서 연결되므로, 완료 개수는 아직 항상 0으로 표시된다.
  const completed = 0

  return (
    <main className="home-page">
      <header className="home-header">
        <div>
          <p className="home-tagline">오늘도 한 장</p>
          <h1>{userDoc?.name ?? user?.email}님의 수첩</h1>
        </div>
        <StreakStamp streak={userDoc?.streak ?? 0} reviewedToday={isToday(userDoc?.lastReviewDate)} />
      </header>

      <section className="home-progress">
        <ProgressBar completed={completed} total={total} />
        <p className="home-skip-tokens">스킵권 {userDoc?.skipTokens ?? 0}개 보유</p>
        <Link className="home-add-note-link" to="/notes/new">
          + 새 필기 입력
        </Link>
      </section>

      <section className="home-list">
        {loading && <p>불러오는 중...</p>}

        {!loading && total === 0 && (
          <div className="home-empty">
            <p>오늘 복습할 문제가 아직 없어요.</p>
            <p>필기를 입력하고 문제를 만들어보세요.</p>
            <Link className="home-start-button" to="/notes/new">
              필기 입력하러 가기
            </Link>
          </div>
        )}

        {!loading && total > 0 && (
          <ul className="home-review-list">
            {items.map((item) => (
              <li key={item.id} className="home-review-item">
                <SubjectTab subject={item.question?.subject ?? '기타'} />
                <span className="home-review-concept">{item.question?.conceptTag}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {total > 0 && (
        <Link className="home-start-button" to="/review">
          오늘 복습 시작
        </Link>
      )}

      <button className="home-logout" onClick={() => logOut()}>
        로그아웃
      </button>
    </main>
  )
}
