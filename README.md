# 행복한 집사생활

고양이·강아지 통합 관리 웹앱 (MVP)

## 시작하기

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경변수 설정

   ```bash
   cp .env.local.example .env.local
   ```

   `.env.local`에 아래 값을 채워주세요.

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로젝트 설정 > API
   - `KAKAO_REST_API_KEY`: 카카오 개발자센터 > 내 애플리케이션 > REST API 키
   - `OPENAI_API_KEY`: OpenAI Platform > API keys

3. Supabase DB 마이그레이션 적용

   Supabase 대시보드의 SQL Editor에서 `supabase/migrations/0001_init.sql` 내용을 실행하거나, Supabase CLI를 사용하는 경우:

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```

4. 개발 서버 실행

   ```bash
   npm run dev
   ```

   http://localhost:3000 에서 확인할 수 있습니다.

## 기술 스택

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)
- 카카오맵 Local API (근처 동물병원)
- OpenAI API (울음 해석 / 행동 분석)

## 폴더 구조

```
src/
  app/            라우트 (페이지, API 라우트)
  lib/supabase/   Supabase 클라이언트 (브라우저/서버/미들웨어)
supabase/
  migrations/     DB 스키마 마이그레이션
```
