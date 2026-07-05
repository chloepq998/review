import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTodayReview } from '../hooks/useTodayReview'
import { submitAnswer, markTodayReviewed } from '../services/reviewService'
import { normalizeAnswer } from '../utils/answer'
import QuestionCard from '../components/QuestionCard'
import '../styles/quiz.css'

const BATCH_SIZE = 5

export default function QuizPage() {
  const { user, userDoc } = useAuth()
  const { items, loading } = useTodayReview()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showCheckpoint, setShowCheckpoint] = useState(false)
  const [finished, setFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <main className="quiz-page">불러오는 중...</main>

  if (items.length === 0) {
    return (
      <main className="quiz-page">
        <p>오늘 복습할 문제가 없어요.</p>
        <Link to="/">홈으로 돌아가기</Link>
      </main>
    )
  }

  if (finished) {
    return (
      <main className="quiz-page quiz-finished">
        <h1>오늘 복습 완료!</h1>
        <p>
          {items.length}문제 중 {correctCount}문제를 맞췄어요.
        </p>
        <Link className="quiz-home-link" to="/">
          홈으로 돌아가기
        </Link>
      </main>
    )
  }

  if (showCheckpoint) {
    return (
      <main className="quiz-page quiz-finished">
        <h1>{BATCH_SIZE}문제 완료!</h1>
        <p>잘하고 있어요. 계속해볼까요?</p>
        <button className="quiz-home-link" onClick={() => setShowCheckpoint(false)}>
          계속하기
        </button>
      </main>
    )
  }

  const current = items[index]

  async function handleSelect(choice) {
    if (revealed || submitting) return
    setSelected(choice)
    setRevealed(true)
    setSubmitting(true)

    const isCorrect = normalizeAnswer(choice) === normalizeAnswer(current.question.correctAnswer)
    if (isCorrect) setCorrectCount((c) => c + 1)

    try {
      await submitAnswer({
        scheduleId: current.id,
        correctStreak: current.correctStreak ?? 0,
        questionType: current.question.type,
        isCorrect,
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNext() {
    const nextIndex = index + 1

    if (nextIndex >= items.length) {
      await markTodayReviewed({ userId: user.uid, userDoc })
      setFinished(true)
      return
    }

    setIndex(nextIndex)
    setSelected(null)
    setRevealed(false)

    if (nextIndex % BATCH_SIZE === 0) {
      setShowCheckpoint(true)
    }
  }

  return (
    <main className="quiz-page">
      <p className="quiz-progress">
        {index + 1} / {items.length}
      </p>
      <QuestionCard
        question={current.question}
        selected={selected}
        revealed={revealed}
        onSelect={handleSelect}
      />
      {revealed && (
        <button className="quiz-next-button" onClick={handleNext}>
          다음
        </button>
      )}
    </main>
  )
}
