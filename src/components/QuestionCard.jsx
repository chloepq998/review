import SubjectTab from './SubjectTab'
import { normalizeAnswer } from '../utils/answer'

export default function QuestionCard({ question, selected, revealed, onSelect }) {
  const choices = question.type === 'ox' ? ['O', 'X'] : question.choices

  return (
    <div className="quiz-card">
      <SubjectTab subject={question.subject} />
      <p className="quiz-question-text">{question.questionText}</p>
      <div className={`quiz-choices${question.type === 'ox' ? ' quiz-choices-ox' : ''}`}>
        {choices.map((choice) => {
          const isSelected = selected === choice
          const isAnswer = normalizeAnswer(choice) === normalizeAnswer(question.correctAnswer)
          let stateClass = ''
          if (revealed && isAnswer) stateClass = 'is-correct'
          else if (revealed && isSelected && !isAnswer) stateClass = 'is-wrong'

          return (
            <button
              key={choice}
              type="button"
              className={`quiz-choice${stateClass ? ` ${stateClass}` : ''}`}
              disabled={revealed}
              onClick={() => onSelect(choice)}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
