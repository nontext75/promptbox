# PromptBox Handoff & Status Report

## 🗓️ 최종 작업일: 2026-04-29
본 문서는 다음 작업 세션을 원활하게 이어가기 위해 작성된 핸드오프(인수인계) 문서입니다.

---

## 🚀 지금까지 완료된 작업 (What's Done)

1. **AI 기반 프롬프트 스크래퍼(Scraper) 구현**
   - 외부 URL(포털, SNS, 미드저니 등)에서 AI가 자동으로 프롬프트와 연관 이미지를 추출하는 기능을 구현했습니다.
   - `/api/scrape` 엔드포인트를 통해 Gemini AI 분석 로직을 연동했습니다.

2. **탐색(Discover) 및 스크랩 기능 추가**
   - 공용 프롬프트를 둘러보고 내 서재로 즉시 복제할 수 있는 `/discover` 페이지를 신설했습니다.
   - 실시간 스크래핑 워크벤치를 통해 외부 콘텐츠를 내 DB로 즉시 저장할 수 있습니다.

3. **브랜드 로고 시스템 구축**
   - 보내주신 로고 이미지를 고화질 SVG 컴포넌트(`Logo.tsx`)로 완벽하게 재구현했습니다.
   - 헤더와 메인 페이지에 일관된 브랜드 아이덴티티를 적용했습니다.

4. **인증 및 데이터베이스 안정화**
   - Supabase Auth를 통한 구글 로그인 및 데이터 연동을 마쳤습니다.
   - `sonner` 및 `next-themes`를 도입하여 알림 시스템과 테마 대응을 완료했습니다.

---

## 🚨 치명적 버그 수정 사항 (중요!)

- **문제**: 계속해서 `Invalid API key` (401 Unauthorized) 에러가 발생했습니다.
- **원인 발견**: 최초에 복사해 둔 Supabase `anon key` 문자열 중간에 오타(`subasase` -> `supabase`로 잘못 인코딩됨)가 포함되어 JWT 서명이 깨져 있었습니다.
- **조치 완료**: 정상적인 `anon key`를 찾아내어 로컬 `.env.local` 파일에 업데이트를 완료했습니다.

---

## 🔑 환경 변수 가이드
`.env.local` 파일은 보안상 깃허브에 올라가지 않습니다. 다른 환경에서 작업을 이어갈 때는 반드시 아래 키들을 새로 설정해 주세요.

```env
NEXT_PUBLIC_SUPABASE_URL=https://nbismihypxsfkbuoqrpb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### ⚠️ GEMINI_API_KEY 설정 필수 (중요!)
이번에 추가된 **'실시간 AI 스크래퍼(Scraper)'** 기능은 Google Gemini API를 사용합니다. 
- 이 키가 없으면 '탐색' 페이지에서 외부 URL을 긁어올 때 `500 에러`가 발생합니다.
- 다른 컴퓨터에서 작업하거나 Vercel에 배포할 때 반드시 이 키를 환경 변수에 추가해 주세요.

---

## 🎯 다음 세션에 바로 해야 할 일 (Next Steps)

1. **미드저니/인스타그램 등 특정 사이트 최적화**
   - 현재는 범용 스크래퍼이나, 특정 사이트의 HTML 구조에 맞춰 이미지 추출 로직을 더 정교하게 고도화할 수 있습니다.
2. **프롬프트 상세 페이지 AI 어시스턴트 강화**
   - 현재 구현된 AI 변형 기능을 실제 사용자가 더 편리하게 쓸 수 있도록 UI/UX를 다듬습니다.
3. **태그 자동 추천 시스템**
   - 프롬프트 저장 시 AI가 적절한 태그를 자동으로 추천하고 등록해 주는 기능을 추가합니다.
