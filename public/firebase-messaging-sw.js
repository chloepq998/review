/* eslint-disable no-undef */
// Firebase 클라이언트 설정값은 등록 시 쿼리스트링으로 전달된다 (Vite 빌드 산출물인
// public 정적 파일에는 환경변수를 직접 주입할 수 없기 때문).
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js')

const params = new URLSearchParams(self.location.search)

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {}
  self.registration.showNotification(title ?? '복습 수첩', {
    body: body ?? '오늘의 복습을 잊지 마세요!',
  })
})
