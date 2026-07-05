import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../firebase/schema'
import { enablePushNotifications } from '../firebase/messaging'
import '../styles/settings.css'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

export default function SettingsPage() {
  const { user, userDoc } = useAuth()
  const [pushStatus, setPushStatus] = useState('')
  const [pushError, setPushError] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [fieldError, setFieldError] = useState('')

  async function updateUserField(field, value) {
    setFieldError('')
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { [field]: value })
    } catch {
      setFieldError('설정 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  async function handleEnablePush() {
    setEnabling(true)
    setPushError(false)
    setPushStatus('')
    try {
      await enablePushNotifications(user.uid)
      setPushStatus('웹 푸시 알림이 켜졌어요.')
    } catch (err) {
      setPushError(true)
      setPushStatus(err.message || '알림 설정에 실패했습니다.')
    } finally {
      setEnabling(false)
    }
  }

  return (
    <div className="settings-page">
      <Link className="settings-back" to="/">
        ← 홈으로
      </Link>
      <h1>마이페이지</h1>

      <section className="settings-section">
        <h2>내 현황</h2>
        <div className="settings-stats">
          <div>
            <div className="settings-stat-value">{userDoc?.streak ?? 0}일</div>
            <div className="settings-stat-label">연속 스트릭</div>
          </div>
          <div>
            <div className="settings-stat-value">{userDoc?.skipTokens ?? 0}개</div>
            <div className="settings-stat-label">스킵권</div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>공개 및 AI 학습 설정</h2>
        {fieldError && <p className="settings-status is-error">{fieldError}</p>}
        <div className="settings-field">
          <label htmlFor="isPublic">내 필기 공개</label>
          <input
            id="isPublic"
            type="checkbox"
            checked={Boolean(userDoc?.isPublic)}
            onChange={(e) => updateUserField('isPublic', e.target.checked)}
          />
        </div>
        <div className="settings-field">
          <label htmlFor="allowAiTraining">AI 학습 활용 허용</label>
          <input
            id="allowAiTraining"
            type="checkbox"
            checked={Boolean(userDoc?.allowAiTraining)}
            onChange={(e) => updateUserField('allowAiTraining', e.target.checked)}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2>알림</h2>
        <div className="settings-field">
          <label htmlFor="notificationHour">리마인더 시간</label>
          <select
            id="notificationHour"
            value={userDoc?.notificationHour ?? 20}
            onChange={(e) => updateUserField('notificationHour', Number(e.target.value))}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}시
              </option>
            ))}
          </select>
        </div>
        <button className="settings-button" onClick={handleEnablePush} disabled={enabling}>
          {enabling ? '설정 중...' : userDoc?.fcmToken ? '웹 푸시 다시 설정' : '웹 푸시 알림 켜기'}
        </button>
        {pushStatus && (
          <p className={`settings-status${pushError ? ' is-error' : ''}`}>{pushStatus}</p>
        )}
      </section>
    </div>
  )
}
