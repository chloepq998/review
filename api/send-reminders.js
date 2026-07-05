import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

// 스코프 단순화: 사용자별 notificationHour 대신, 하루 1회 고정 시간(Vercel Cron)에
// 오늘 복습을 안 한 사용자 전원에게 발송한다. 세분화는 다음 단계 과제로 남겨둔다.

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  return initializeApp({ credential: cert(serviceAccount) })
}

function isToday(timestamp) {
  if (!timestamp) return false
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toDateString() === new Date().toDateString()
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
  }

  const firebaseApp = getAdminApp()
  const db = getFirestore(firebaseApp)
  const messaging = getMessaging(firebaseApp)

  const usersSnap = await db.collection('users').get()
  const targets = usersSnap.docs.filter((docSnap) => {
    const user = docSnap.data()
    return Boolean(user.fcmToken) && !isToday(user.lastReviewDate)
  })

  const results = await Promise.allSettled(
    targets.map((docSnap) =>
      messaging.send({
        token: docSnap.data().fcmToken,
        notification: {
          title: '복습 수첩',
          body: '오늘 복습을 아직 안 하셨어요! 잊지 말고 한 장 넘겨보세요.',
        },
      }),
    ),
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  res.status(200).json({ sent, total: targets.length })
}
