# 복습 수첩

학생이 자기 필기를 입력하면 AI가 사지선다/OX 문제를 만들고, 간격 반복 알고리즘으로 복습 스케줄을 자동 관리해주는 웹앱.

## 스택
- React (Vite)
- Firebase (Firestore + Auth)
- Vercel 배포 (프론트 + `/api` 서버리스 함수)
- Claude API (문제 생성)
- Firebase Cloud Messaging (웹 푸시)

## 로컬 개발 준비

1. 의존성 설치
   ```
   npm install
   ```
2. Firebase 콘솔(https://console.firebase.google.com)에서 프로젝트를 생성하고, 웹 앱을 추가한 뒤 `.env.example`을 `.env`로 복사해 값을 채운다.
   ```
   cp .env.example .env
   ```
3. Firebase 콘솔에서 Authentication > 이메일/비밀번호 로그인을 활성화한다.
4. Firebase 콘솔에서 Firestore Database를 생성한다 (프로덕션 모드로 시작해도 무방 — 규칙은 이 저장소의 `firestore.rules`를 배포해서 사용).
5. Firebase CLI로 규칙/인덱스 배포 (선택, 콘솔에서 직접 붙여넣어도 됨):
   ```
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes --project <프로젝트ID>
   ```
6. 개발 서버 실행
   ```
   npm run dev
   ```

## Firestore 데이터 모델

`src/firebase/schema.js` 참고. 컬렉션: `users`, `notes`, `questions`, `reviewSchedule`.

## 보안 규칙 요약 (`firestore.rules`)

- `users`: 본인 문서만 쓰기 가능, `isPublic == true`인 경우 다른 사용자도 읽기 가능
- `notes`, `questions`: 소유자만 쓰기 가능, 공개(`isPublic`) 사용자의 데이터는 읽기만 허용. `questions`는 `isFlagged` 필드만 예외적으로 타인이 갱신 가능(신고 기능용)
- `reviewSchedule`: 소유자만 읽기/쓰기 가능 (개인 복습 스케줄이므로 비공개)
