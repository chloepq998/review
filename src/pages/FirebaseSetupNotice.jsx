export default function FirebaseSetupNotice() {
  return (
    <main style={{ padding: '2rem', maxWidth: 480, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <h1>Firebase 설정이 필요합니다</h1>
      <p>
        `.env.example`을 `.env`로 복사한 뒤, Firebase 콘솔에서 발급받은 값을 채워주세요.
        값을 채우고 나면 개발 서버를 재시작해야 반영됩니다.
      </p>
      <p>자세한 절차는 README.md의 &quot;로컬 개발 준비&quot; 항목을 참고해주세요.</p>
    </main>
  )
}
