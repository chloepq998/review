import { useCallback, useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../firebase/schema'
import { useAuth } from '../context/AuthContext'

function endOfToday() {
  const date = new Date()
  date.setHours(23, 59, 59, 999)
  return date
}

export function useTodayReview() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const scheduleQuery = query(
        collection(db, COLLECTIONS.REVIEW_SCHEDULE),
        where('userId', '==', user.uid),
        where('nextReviewDate', '<=', Timestamp.fromDate(endOfToday())),
      )
      const scheduleSnap = await getDocs(scheduleQuery)
      const schedules = scheduleSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      const withQuestions = await Promise.all(
        schedules.map(async (schedule) => {
          const questionSnap = await getDoc(doc(db, COLLECTIONS.QUESTIONS, schedule.questionId))
          return { ...schedule, question: questionSnap.exists() ? questionSnap.data() : null }
        }),
      )

      setItems(withQuestions.filter((item) => item.question?.isActive !== false))
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, refetch: load }
}
