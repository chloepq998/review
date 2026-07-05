export default function StreakStamp({ streak, reviewedToday }) {
  return (
    <div className={`streak-stamp${reviewedToday ? ' is-stamped' : ''}`}>
      <span className="streak-stamp-number">{streak}</span>
      <span className="streak-stamp-label">일째</span>
    </div>
  )
}
