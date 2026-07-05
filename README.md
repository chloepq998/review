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
   (로그인 화면에는 학번만 보이지만, 내부적으로는 `{학번}@student.review-notebook.local` 형태의
   가짜 이메일로 변환해서 Firebase Auth의 이메일/비밀번호 로그인을 그대로 사용한다.
   실제 이메일이 없어서 "비밀번호 찾기"는 지원하지 않는다.)
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

## AI 문제 생성 (`/api/generate-questions`)

문제 생성은 Claude API 키를 클라이언트에 노출하지 않기 위해 Vercel 서버리스 함수(`api/generate-questions.js`)에서 처리한다.

- `npm run dev`(Vite 개발 서버)만으로는 `/api` 라우트가 동작하지 않는다. 로컬에서 AI 문제 생성까지 테스트하려면 [Vercel CLI](https://vercel.com/docs/cli)로 `vercel dev`를 실행해야 한다.
- `.env`에 `ANTHROPIC_API_KEY`를 채워야 한다 (Vercel 배포 시에는 Vercel 프로젝트 환경변수로 등록).
- 생성 로직: 구조화된 출력(tool use)으로 문제를 강제 생성 → 코드 레벨 규칙 필터(오답 중복/보기 길이 편차 체크) → 같은 API로 2차 검증 → 실패 시 최대 2회 재생성, 그래도 실패하면 `needsHumanReview` 플래그를 달아 저장.
- 필기 1개당 문제는 최대 5개까지만 생성되며, 같은 노트로 재요청 시 Firestore에 캐싱된 문제를 재사용한다.

## 웹 푸시 리마인더 (`/api/send-reminders`)

오늘 복습을 하지 않은 사용자에게 하루 1회(20:00 KST, `vercel.json`의 `crons` 설정) 웹 푸시를 보낸다.
사용자별 알림 시간(`notificationHour`)은 마이페이지에서 설정할 수 있지만, 발송 자체는 스코프를 단순화해
고정 시간에만 이루어진다 (세분화는 다음 단계 과제).

설정 방법:
1. Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > "새 비공개 키 생성"으로 JSON 키를 받는다.
2. 그 JSON 파일 내용을 한 줄 문자열로 `FIREBASE_SERVICE_ACCOUNT` 환경변수에 설정한다.
3. Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 탭 > 웹 구성에서 VAPID 키를 발급받아 `VITE_FIREBASE_VAPID_KEY`에 설정한다.
4. (선택) `CRON_SECRET`을 임의의 값으로 설정하면 `/api/send-reminders`가 Vercel Cron 호출만 허용한다.
5. Vercel Cron은 Vercel에 배포된 프로젝트에서만 동작한다 — 로컬에서는 `curl localhost:3000/api/send-reminders`로 직접 호출해 테스트한다 (`vercel dev` 필요).

## Firestore 데이터 모델

`src/firebase/schema.js` 참고. 컬렉션: `users`, `notes`, `questions`, `reviewSchedule`.

## 보안 규칙 요약 (`firestore.rules`)

- `users`: 본인 문서만 쓰기 가능, `isPublic == true`인 경우 다른 사용자도 읽기 가능
- `notes`, `questions`: 소유자만 쓰기 가능, 공개(`isPublic`) 사용자의 데이터는 읽기만 허용. `questions`는 `isFlagged` 필드만 예외적으로 타인이 갱신 가능(신고 기능용)
- `reviewSchedule`: 소유자만 읽기/쓰기 가능 (개인 복습 스케줄이므로 비공개)
