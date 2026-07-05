import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logIn } from '../firebase/auth'
import { toAuthErrorMessage } from '../firebase/authErrors'
import '../styles/auth.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await logIn({ email, password })
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
        <p className="auth-tagline">오늘도 한 장 넘겨볼까요?</p>
        <h1 className="auth-title">로그인</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="auth-switch">
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  )
}
