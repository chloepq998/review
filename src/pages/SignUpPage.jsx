import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../firebase/auth'
import { toAuthErrorMessage } from '../firebase/authErrors'
import '../styles/auth.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [allowAiTraining, setAllowAiTraining] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      await signUp({ name, studentId, password, isPublic, allowAiTraining })
      navigate('/', { replace: true })
    } catch (err) {
      setError(toAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-tagline">첫 페이지를 열어볼까요?</p>
        <h1 className="auth-title">회원가입</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="studentId">학번</label>
            <input
              id="studentId"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          <div className="auth-consent">
            <label className="auth-consent-item">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>내 필기를 다른 사용자에게 공개합니다. (기본값: 비공개)</span>
            </label>
            <label className="auth-consent-item">
              <input
                type="checkbox"
                checked={allowAiTraining}
                onChange={(e) => setAllowAiTraining(e.target.checked)}
              />
              <span>내 필기를 AI 학습에 활용하는 것을 허용합니다. (기본값: 비허용)</span>
            </label>
          </div>

          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="auth-switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}
