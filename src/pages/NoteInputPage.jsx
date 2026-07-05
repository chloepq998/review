import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SUBJECTS } from '../firebase/schema'
import { createNoteAndGenerateQuestions } from '../services/noteQuestionService'
import '../styles/noteInput.css'

const MAX_RAW_TEXT_LENGTH = 4000
const CUSTOM_SUBJECT_VALUE = '__custom__'

export default function NoteInputPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [subjectChoice, setSubjectChoice] = useState(SUBJECTS[0])
  const [customSubject, setCustomSubject] = useState('')
  const [conceptTag, setConceptTag] = useState('')
  const [rawText, setRawText] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const subject = subjectChoice === CUSTOM_SUBJECT_VALUE ? customSubject.trim() : subjectChoice

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!subject) {
      setError('과목을 입력해주세요.')
      return
    }
    if (!conceptTag.trim()) {
      setError('개념 태그를 입력해주세요.')
      return
    }
    if (!rawText.trim()) {
      setError('필기 내용을 입력해주세요.')
      return
    }

    setSubmitting(true)
    setStatusMessage('AI가 문제를 만들고 있어요...')
    try {
      const { questions } = await createNoteAndGenerateQuestions({
        userId: user.uid,
        subject,
        conceptTag: conceptTag.trim(),
        rawText: rawText.trim(),
      })
      setStatusMessage(`문제 ${questions.length}개를 만들었어요!`)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || '문제 생성 중 오류가 발생했습니다.')
      setStatusMessage('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="note-input-page">
      <Link className="note-input-back" to="/">
        ← 홈으로
      </Link>
      <h1>새 필기 입력</h1>
      <form className="note-input-form" onSubmit={handleSubmit}>
        <div className="note-input-field">
          <label htmlFor="subject">과목</label>
          <select
            id="subject"
            value={subjectChoice}
            onChange={(e) => setSubjectChoice(e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value={CUSTOM_SUBJECT_VALUE}>직접 입력...</option>
          </select>
        </div>

        {subjectChoice === CUSTOM_SUBJECT_VALUE && (
          <div className="note-input-field">
            <label htmlFor="customSubject">과목 이름</label>
            <input
              id="customSubject"
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>
        )}

        <div className="note-input-field">
          <label htmlFor="conceptTag">개념 태그</label>
          <input
            id="conceptTag"
            type="text"
            placeholder="예: 이차방정식의 근의 공식"
            value={conceptTag}
            onChange={(e) => setConceptTag(e.target.value)}
          />
        </div>

        <div className="note-input-field">
          <label htmlFor="rawText">필기 내용</label>
          <textarea
            id="rawText"
            maxLength={MAX_RAW_TEXT_LENGTH}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <span className="note-input-charcount">
            {rawText.length} / {MAX_RAW_TEXT_LENGTH}
          </span>
        </div>

        {error && <p className="note-input-error">{error}</p>}
        {!error && statusMessage && <p>{statusMessage}</p>}

        <button className="note-input-submit" type="submit" disabled={submitting}>
          {submitting ? '문제 만드는 중...' : '문제 만들기'}
        </button>
      </form>
    </div>
  )
}
