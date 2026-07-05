import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logOut } from '../firebase/auth'
import { useTodayReview } from '../hooks/useTodayReview'
import {
  applyStreakMaintenance,
  grantWeeklySkipTokenIfDue,
  consumeSkipToken,
} from '../services/reviewService'
import { getTodayTotal } from '../utils/todayProgress'
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
  const { items, loading, refetch } = useTodayReview()
  const [usingSkipToken, setUsingSkipToken] = useState(false)

  useEffect(() => {
    if (!user || !userDoc) return
    applyStreakMaintenance({ userId: user.uid, userDoc })
    grantWeeklySkipTokenIfDue({ userId: user.uid, userDoc })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, Boolean(userDoc)])

  const remaining = items.length
  const total = getTodayTotal(remaining)
  const completed = Math.max(total - remaining, 0)
  const reviewedToday = isToday(userDoc?.lastReviewDate)
  const canUseSkipToken = !reviewedToday && remaining > 0 && (userDoc?.skipTokens ?? 0) > 0

  async function handleUseSkipToken() {
    if (!canUseSkipToken || usingSkipToken) return
    setUsingSkipToken(true)
    try {
      await consumeSkipToken({ userId: user.uid, userDoc, todayScheduleItems: items })
      await refetch()
    } finally {
      setUsingSkipToken(false)
    }
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <div>
          <p className="home-tagline">오늘도 한 장</p>
          <h1>{userDoc?.name ?? user?.email}님의 수첩</h1>
        </div>
        <div className="home-header-right">
          <StreakStamp streak={userDoc?.streak ?? 0} reviewedToday={reviewedToday} />
          <Link className="home-settings-link" to="/settings">
            마이페이지
          </Link>
        </div>
      </header>

      <section className="home-progress">
        <ProgressBar completed={completed} total={total} />
        <p className="home-skip-tokens">
          스킵권 {userDoc?.skipTokens ?? 0}개 보유
          {canUseSkipToken && (
            <button
              className="home-skip-button"
              onClick={handleUseSkipToken}
              disabled={usingSkipToken}
            >
              {usingSkipToken ? '사용 중...' : '스킵권 사용'}
            </button>
          )}
        </p>
        <Link className="home-add-note-link" to="/notes/new">
          + 새 필기 입력
        </Link>
      </section>

      <section className="home-list">
        {loading && <p>불러오는 중...</p>}

        {!loading && remaining === 0 && (
          <div className="home-empty">
            <p>오늘 복습할 문제가 아직 없어요.</p>
            <p>필기를 입력하고 문제를 만들어보세요.</p>
            <Link className="home-start-button" to="/notes/new">
              필기 입력하러 가기
            </Link>
          </div>
        )}

        {!loading && remaining > 0 && (
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

      {remaining > 0 && (
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
