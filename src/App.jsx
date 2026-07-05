import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'

function App() {
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      () => setStatus('connected'),
      () => setStatus('error'),
    )
    return unsubscribe
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>복습 수첩</h1>
      <p>Firebase Auth 연결 상태: {status}</p>
      <p>다음 단계에서 로그인/회원가입 화면이 이 자리에 들어갑니다.</p>
    </main>
  )
}

export default App
