import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'
const MAX_QUESTIONS_PER_NOTE = 5
const MAX_RETRIES_PER_QUESTION = 2
const MAX_RAW_TEXT_LENGTH = 4000

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SUBMIT_QUESTION_TOOL = {
  name: 'submit_question',
  description: '학생 필기를 바탕으로 만든 복습 문제 하나를 제출한다.',
  input_schema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['multiple_choice', 'ox'] },
      questionText: { type: 'string', description: '문제 본문' },
      choices: {
        type: 'array',
        items: { type: 'string' },
        description: 'multiple_choice일 때 정확히 4개, ox일 때는 빈 배열',
      },
      correctAnswer: {
        type: 'string',
        description: 'multiple_choice면 choices 중 하나와 정확히 동일한 문자열, ox면 "O" 또는 "X"',
      },
      conceptTag: { type: 'string', description: '이 문제가 다루는 세부 개념 태그' },
    },
    required: ['type', 'questionText', 'choices', 'correctAnswer', 'conceptTag'],
  },
}

const VERIFY_QUESTION_TOOL = {
  name: 'submit_verification',
  description: '문제 검증 결과를 제출한다.',
  input_schema: {
    type: 'object',
    properties: {
      valid: { type: 'boolean', description: '정답이 명확히 하나뿐이고 오답이 명백히 틀렸으면 true' },
      reason: { type: 'string' },
    },
    required: ['valid'],
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { rawText, subject, conceptTag, count } = req.body ?? {}

  if (!rawText || !subject || !conceptTag) {
    res.status(400).json({ error: 'rawText, subject, conceptTag는 필수입니다.' })
    return
  }

  if (rawText.length > MAX_RAW_TEXT_LENGTH) {
    res.status(400).json({ error: `필기는 ${MAX_RAW_TEXT_LENGTH}자를 넘을 수 없습니다.` })
    return
  }

  const requestedCount = Math.min(
    Number.isFinite(Number(count)) ? Number(count) : MAX_QUESTIONS_PER_NOTE,
    MAX_QUESTIONS_PER_NOTE,
  )

  try {
    const questions = []
    for (let i = 0; i < requestedCount; i += 1) {
      const question = await generateOneQuestion({ rawText, subject, conceptTag, existing: questions })
      if (question) questions.push(question)
    }
    res.status(200).json({ questions })
  } catch (error) {
    console.error('generate-questions failed', error)
    res.status(500).json({ error: '문제 생성 중 오류가 발생했습니다.' })
  }
}

async function generateOneQuestion({ rawText, subject, conceptTag, existing }) {
  for (let attempt = 0; attempt <= MAX_RETRIES_PER_QUESTION; attempt += 1) {
    const candidate = await requestQuestion({ rawText, subject, conceptTag, existing })
    if (!candidate || !passesRuleBasedFilter(candidate)) continue

    const isValid = await verifyQuestion({ rawText, candidate })
    if (isValid) return { ...candidate, needsHumanReview: false }

    if (attempt === MAX_RETRIES_PER_QUESTION) {
      return { ...candidate, needsHumanReview: true }
    }
  }
  return null
}

async function requestQuestion({ rawText, subject, conceptTag, existing }) {
  const avoid = existing.map((q) => q.questionText).join('\n')
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [SUBMIT_QUESTION_TOOL],
    tool_choice: { type: 'tool', name: 'submit_question' },
    messages: [
      {
        role: 'user',
        content: [
          `과목: ${subject}`,
          `개념 태그: ${conceptTag}`,
          `학생 필기:\n${rawText}`,
          existing.length > 0
            ? `이미 만든 문제와 중복되지 않게 만들어줘:\n${avoid}`
            : '',
          '위 필기 내용을 바탕으로 사지선다 또는 OX 복습 문제를 하나 만들어줘. 정답은 명확히 하나여야 하고, 오답은 명백히 틀린 내용이어야 해.',
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ],
  })

  const toolUse = message.content.find((block) => block.type === 'tool_use')
  return toolUse?.input ?? null
}

async function verifyQuestion({ rawText, candidate }) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    tools: [VERIFY_QUESTION_TOOL],
    tool_choice: { type: 'tool', name: 'submit_verification' },
    messages: [
      {
        role: 'user',
        content: [
          `원본 필기:\n${rawText}`,
          `생성된 문제: ${JSON.stringify(candidate)}`,
          '이 문제가 정답이 명확히 하나뿐이고 오답이 명백히 틀렸는지 확인해줘.',
        ].join('\n\n'),
      },
    ],
  })

  const toolUse = message.content.find((block) => block.type === 'tool_use')
  return toolUse?.input?.valid === true
}

function passesRuleBasedFilter(candidate) {
  if (candidate.type === 'ox') {
    return ['O', 'X'].includes(String(candidate.correctAnswer).toUpperCase())
  }

  if (candidate.type !== 'multiple_choice') return false

  const choices = Array.isArray(candidate.choices) ? candidate.choices.map((c) => c.trim()) : []
  if (choices.length !== 4) return false

  // 오답 중 정답과 텍스트가 동일하면 자동 폐기
  if (new Set(choices).size !== 4) return false
  if (!choices.includes(candidate.correctAnswer.trim())) return false

  // 보기 4개 중 길이가 극단적으로 다르면 재생성
  const lengths = choices.map((c) => c.length)
  const maxLen = Math.max(...lengths)
  const minLen = Math.min(...lengths)
  if (minLen > 0 && maxLen / minLen > 3) return false

  return true
}
