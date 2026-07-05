import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// 앱이 아직 아무것도 그리기 전에 (Firebase 설정 오류 등으로) 크래시하면
// 흰 화면 대신 에러 내용을 보여준다. 앱이 정상적으로 렌더링된 뒤에는 건드리지 않는다.
function showBootFailure(message) {
  const root = document.getElementById('root')
  if (!root || root.childElementCount > 0) return
  root.innerHTML =
    '<main style="padding:2rem;max-width:480px;margin:0 auto;font-family:sans-serif;">' +
    '<h1>문제가 발생했어요</h1>' +
    '<p>Firebase 환경변수 등 설정값을 확인해주세요.</p>' +
    `<pre style="white-space:pre-wrap;color:#c23b2f;font-size:0.85rem;">${String(message).replace(/</g, '&lt;')}</pre>` +
    '</main>'
}

window.addEventListener('error', (event) => {
  showBootFailure(event.message || String(event.error))
})
window.addEventListener('unhandledrejection', (event) => {
  showBootFailure(event.reason?.message || String(event.reason))
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
