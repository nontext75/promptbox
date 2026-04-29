# PromptBox Handoff & Status Report

## 🗓️ 최종 작업일: 2026-04-29
본 문서는 다음 작업 세션을 원활하게 이어가기 위해 작성된 핸드오프(인수인계) 문서입니다.

---

## 🚀 지금까지 완료된 작업 (What's Done)

1. **Supabase 데이터베이스 전환 완료**
   - 로컬 스토리지 의존성을 제거하고 Supabase DB 연동을 마쳤습니다.
   - `use-prompts.ts` 훅을 통해 데이터를 Supabase에서 직접 읽고/쓰도록 개편했습니다.

2. **Google OAuth 인증 연동 완료**
   - Supabase Auth를 활용한 Google 로그인 기능을 구현했습니다.
   - 랜딩 페이지 UI와 로그인 플로우를 분리하여, 인증되지 않은 사용자는 랜딩 페이지를 보도록 처리했습니다.
   - Vercel 배포 URL(`promptbox-bice.vercel.app`)을 Supabase 리디렉션 목록에 등록했습니다.

3. **Vercel 자동 배포 환경 구축 및 오류 해결**
   - Next.js 16과 `@supabase/auth-helpers-nextjs` 호환성 문제(`createRouteHandlerClient` -> `createServerClient`, `await cookies()`)를 모두 해결하고 Vercel 빌드를 성공시켰습니다.
   - UI 라이브러리(`@base-ui`)의 `asChild` 속성 충돌 에러를 해결했습니다.

---

## 🚨 치명적 버그 수정 사항 (중요!)

- **문제**: 계속해서 `Invalid API key` (401 Unauthorized) 에러가 발생했습니다.
- **원인 발견**: 최초에 복사해 둔 Supabase `anon key` 문자열 중간에 오타(`subasase` -> `supabase`로 잘못 인코딩됨)가 포함되어 JWT 서명이 깨져 있었습니다.
- **조치 완료**: 정상적인 `anon key`를 찾아내어 로컬 `.env.local` 파일에 업데이트를 완료했습니다.

---

## 🔑 환경 변수 복구 가이드 (다른 컴퓨터에서 시작할 때)
`.env.local` 파일은 깃허브에 올라가지 않습니다! 다른 컴퓨터에서 GitHub 코드를 다운받으신 후에는, 최상위 폴더에 `.env.local` 파일을 하나 만드시고 아래 내용을 **그대로 붙여넣어 주세요.**

```env
NEXT_PUBLIC_SUPABASE_URL=https://nbismihypxsfkbuoqrpb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaXNtaWh5cHhzZmtidW9xcnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDQ5MjUsImV4cCI6MjA5MzAyMDkyNX0.o0ssBx1PHy7JiPjPrpWEzq65Ogf6110_Hc9uDXvNrlw
```

---

## 🎯 다음 세션에 바로 해야 할 일 (Next Steps)

1. **Vercel 환경 변수 업데이트 (1순위)**
   - Vercel 대시보드로 이동하여 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수의 값을 위 올바른 키로 교체합니다.
   - 저장 후 반드시 **[Redeploy]**를 실행하여 새 키가 서버에 적용되도록 합니다.
   - 이후 브라우저에서 `https://promptbox-bice.vercel.app/`로 접속하여 구글 로그인이 정상적으로 작동하는지 최종 테스트합니다.

2. **AI 기능 실제 연동**
   - 현재 Mock(가짜 데이터)으로만 처리되어 있는 `handleAiModify` 등의 AI 프롬프트 생성/요약 기능을 실제 OpenAI 또는 Anthropic API와 연결합니다.

3. **프롬프트 태그 및 필터링 고도화**
   - 저장된 프롬프트 목록에서 카테고리와 태그를 기반으로 세부 검색 및 필터링 기능을 강화합니다.
