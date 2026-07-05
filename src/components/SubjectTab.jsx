import { getSubjectColor } from '../utils/subjectColors'

export default function SubjectTab({ subject }) {
  return (
    <span className="subject-tab" style={{ backgroundColor: getSubjectColor(subject) }}>
      {subject}
    </span>
  )
}
