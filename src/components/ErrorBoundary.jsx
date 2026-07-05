import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: '2rem', maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif' }}>
          <h1>문제가 발생했어요</h1>
          <p>Firebase 환경변수 등 설정값을 확인해주세요.</p>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#c23b2f', fontSize: '0.85rem' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </main>
      )
    }
    return this.props.children
  }
}
