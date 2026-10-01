@apps/web/AGENTS.md

# my-notes

velog 형식의 화면으로 나만 보는 개인 마크다운 노트 앱. 계획과 진행 상황은 `docs/roadmap.md`에 있다.

화면에 보이는 사이트 이름은 **차곡 (Chagok)** 이다. 프로젝트(레포, 폴더, 패키지) 이름은 그대로 `my-notes`다.

노트를 순서대로 묶는 기능(velog의 시리즈)은 **화면에서 "묶음"**이라고 부른다. 코드, API, DB에서는 그대로 `series`다 (`Series` 모델, `/api/series`, `seriesName`, `seriesOrder`). 순서는 "N번째"로 표시한다.

묶음은 velog처럼 **따로 만들거나 지우지 않는다.** 노트를 저장할 때 묶음 이름(`seriesName`)을 보내면 없는 이름은 서버가 새로 만들고, 마지막 노트가 빠지면(삭제, 이동, 빼기) 묶음도 자동으로 지운다. 빈 묶음은 남기지 않는다.

## 아키텍처

회사처럼 프론트와 백엔드를 나눈다. **pnpm workspace 모노레포**로 저장소는 하나, 앱은 둘이다.

- `apps/web`: 프론트 Next.js (포트 3000). 화면만 담당하고 **DB나 백엔드 코드를 import하지 않는다.** 데이터는 오직 REST API로 주고받는다
  - ESLint `no-restricted-imports`로 강제한다 (`apps/web/eslint.config.mjs`). Prisma나 `apps/api` 코드를 import하면 린트 에러
- `apps/api`: 백엔드 Next.js (포트 4000). Route Handler로 REST API를 만들고 Prisma로 MySQL에 접근한다

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, pnpm
- 프론트에서 브라우저가 API를 부를 때(저장 버튼, 무한스크롤, 검색)는 React Query(TanStack Query v5). 첫 화면은 서버 컴포넌트에서 조회한다
- 알림 토스트는 sonner. **성공**(저장, 수정, 삭제)은 토스트로, **실패**는 토스트 대신 문제가 난 자리(버튼 옆)에 빨간 글씨로 보여준다
- 백엔드 입력 검증은 zod 4
- DB는 MySQL 8, ORM은 Prisma다 (팀 프로젝트와 같은 스택이라 선택. 다른 DB나 ORM을 제안하지 않는다)
- 개발용 MySQL은 Docker Compose로 로컬에서 띄운다

## 명령어

모든 명령은 **저장소 루트**에서 실행한다. 특정 앱에서만 실행하려면 `pnpm --filter web ...` / `pnpm --filter api ...`를 쓴다.

- `docker compose up -d --wait`: 로컬 MySQL 실행 (`pnpm dev`가 `predev`로 자동 실행한다. `docker compose down`으로 중지, `down -v`는 데이터까지 삭제). Docker Desktop이 켜져 있어야 한다
- `pnpm dev`: MySQL을 먼저 띄운 뒤(`predev`) 모든 앱의 개발 서버를 동시에 실행 (web: http://localhost:3000, api: http://localhost:4000)
- `pnpm build` / `pnpm lint` / `pnpm typecheck`: 모든 앱에서 빌드, 린트, 타입 검사
- `pnpm format` / `pnpm format:check`: 저장소 전체 Prettier (Tailwind 클래스 자동 정렬 포함)
- `pnpm db:migrate --name 변경내용`: 마이그레이션 만들고 DB에 반영. 이후 `pnpm db:generate`로 클라이언트 코드 재생성 (Prisma 7은 자동 생성하지 않음)
- `pnpm db:seed`: 개발용 예시 데이터로 초기화 (기존 데이터 삭제됨)
- `pnpm db:studio`: 브라우저에서 DB 내용 보기

작업을 마치면 `typecheck`, `lint`, `format:check`, `build`를 통과시킨다.

## 환경 변수

앱마다 자기 `.env`를 가진다 (회사에서 레포마다 따로 있는 것과 같다). 각 폴더의 `.env.example`을 복사해서 만든다.

- 루트 `.env`: MySQL 컨테이너 설정 (`compose.yaml`이 읽음)
- `apps/api/.env`: `DATABASE_URL` (DB 주소는 백엔드만 안다), `CORS_ORIGINS` (브라우저 호출을 허락할 프론트 주소)
- `apps/web/.env`: `API_URL` (서버 컴포넌트용 백엔드 주소), `NEXT_PUBLIC_API_URL` (브라우저용 백엔드 주소, 누구나 볼 수 있으니 비밀 값 금지). 프론트는 DB 정보를 갖지 않는다

## 구조: apps/web (프론트)

- `src/app/(main)/`: 헤더가 있는 화면들 (홈, 읽기). 라우트 그룹이라 URL에는 나타나지 않음
- `src/app/(main)/not-found.tsx`, `error.tsx`: 헤더 안에 보이는 404, 에러 화면. `(main)` 밖(`/write`, 없는 주소)은 `src/app/not-found.tsx`, `src/app/write/error.tsx`가 맡는다
- `src/app/_components/providers.tsx`: React Query Provider (`"use client"`). 루트 `layout.tsx`가 감싼다. 서버는 요청마다, 브라우저는 하나의 QueryClient
- `src/app/icon.svg`: 파비콘 (Next.js 파일 규칙). 헤더 로고 `(main)/_components/logo.tsx`와 같은 모양이라 함께 고친다
- 화면은 velog 모티브: 목록형 홈(카드형 보기는 없음), 읽기 페이지, 헤더 없는 전체 화면 글쓰기(`/write`, 왼쪽 에디터 + 오른쪽 미리보기)
- 컴포넌트 위치는 colocation 방식이다 (파일명은 kebab-case, export는 named export)
  - 한 라우트(그룹)에서만 쓰면 그 폴더의 `_components/`에 둔다 (예: `src/app/(main)/_components/header.tsx`). `_`로 시작하는 폴더는 라우팅에서 제외된다
  - 여러 라우트에서 같이 쓰면 `src/components/`에 둔다 (예: `markdown-preview.tsx`)
  - 한 곳에서만 쓰던 컴포넌트를 다른 라우트에서도 쓰게 되면 `src/components/`로 옮긴다
- `src/api/`: 백엔드 API 호출 함수. 화면은 `fetch`를 직접 쓰지 않고 여기 함수(`getNote` 등)만 호출한다
  - `client.ts`: 공통 호출 함수 (`API_URL` 붙이기, 실패 시 `ApiError`). `apiGet`은 `connection()`을 먼저 기다려서 페이지가 빌드 때 데이터로 굳지 않게 한다. 하나를 조회할 때는 `apiGetOrNull`(404, 400이면 `null` → 화면에서 `notFound()`)
  - `errors.ts`: `ApiError`와 `getErrorMessage`(실패 문구. 버튼 옆 빨간 글씨에 쓴다)
  - `notes.ts`: 노트 API. JSON의 날짜 문자열을 `Date`로 바꿔서 돌려준다
  - `client.ts`, `notes.ts`는 `server-only`(서버 컴포넌트 전용)
  - `types.ts`: 응답 타입과 날짜 변환 (서버용, 브라우저용 공용)
  - `browser.ts`: 브라우저(클라이언트 컴포넌트)에서 부르는 함수. `NEXT_PUBLIC_API_URL` 사용
  - `query-keys.ts`: React Query 이름표(query key). 문자열을 직접 쓰지 않고 `noteKeys`를 쓴다
  - **노트를 저장, 수정, 삭제한 뒤에는 `queryClient.removeQueries({ queryKey: noteKeys.lists() })`로 홈 목록 기억을 지운다.** 안 지우면 홈에 예전 목록이 보인다
- `src/lib/`: 서버와 브라우저 어디서나 쓰는 순수 함수 (`format.ts`: 날짜 표시, `note-list-params.ts`: 홈 검색어와 정렬 URL 해석)

## 구조: apps/api (백엔드)

- `src/proxy.ts`: 모든 `/api` 요청이 먼저 거치는 곳 (Next 16의 Proxy, 예전 이름 middleware). CORS 허가 헤더를 붙이고 사전 확인(OPTIONS)에 204로 답한다
- `src/app/api/**/route.ts`: REST API (Route Handler). 폴더 경로가 API 주소, export한 함수 이름(`GET`, `POST` 등)이 HTTP 메서드
  - **HTTP만 담당**한다: 요청 값 꺼내기, 입력 검사, 상태 코드(200/400/404) 결정. `prisma`를 직접 쓰지 않고 `src/server/*.ts` 함수를 호출한다
  - URL 값은 `Number()`로 바로 바꾸지 말고 문자열 형식부터 검사한다 (`"1e1"`, `"0x13"`도 숫자로 바뀌어 통과함)
  - 에러 응답 형식: `{ "message": "..." }`. 입력 검증(zod) 실패는 칸별 메시지를 더해 `{ "message", "fieldErrors": { "title": ["..."] } }`
  - 새로 만들면 201 Created와 `Location` 헤더(새 리소스 주소), 지우면 204 No Content(본문 없음)로 응답한다
  - 중복(@unique) 같은 "지금 데이터와 충돌"은 409 Conflict. 미리 조회하지 말고 만들어 보고 Prisma `P2002`를 잡는다
  - **모든 API 함수는 `withErrorHandling`(`src/lib/with-error-handling.ts`)으로 감싼다** (`export const GET = withErrorHandling(async (request) => ...)`). 예상 못 한 에러는 서버 로그에 원인을 남기고 500 `{ message }`로 응답한다. 에러 내용(DB 주소, SQL)을 응답에 넣지 않는다
  - 400, 404처럼 예상한 에러는 각 API가 직접 응답한다
  - 목록 API는 배열 대신 `{ items }` 객체로 응답한다 (무한스크롤 때 `nextCursor`를 추가할 수 있게)
  - 요청 본문은 `parseBody(request, 스키마)`(`src/lib/parse-body.ts`)로 읽고 검사한다. URL의 id도 zod 스키마(`noteIdSchema`)로 검사한다
  - 검색(`q`)은 제목과 본문의 LIKE 검색이다. `%`, `_`는 LIKE의 특수 기호라 `escapeLike`로 이스케이프한다 (안 하면 "%" 검색에 모든 노트가 나옴)
  - 목록은 커서 페이지네이션이다: `?limit=20&cursor=...` → `{ items, nextCursor }`. 커서는 마지막 노트의 `createdAt`과 `id`를 base64url로 묶은 불투명한 문자열 (`server/notes/cursor.ts`)
  - 현재 API: `GET /api/health`, `GET /api/notes?q=&sort=latest|oldest&limit=&cursor=`, `POST /api/notes`, `GET /api/notes/:id`, `PATCH /api/notes/:id`, `DELETE /api/notes/:id`, `GET /api/series`, `GET /api/series/:id`
- `requests.http`: API를 직접 호출해 보는 파일 (VS Code REST Client). API를 추가하면 여기에도 예시 요청을 추가한다
- `prisma/schema.prisma`: DB 설계도(모델). 설정은 `prisma7.config.ts`, 생성 코드는 `src/generated/prisma`(git 제외)
- `prisma/seed.ts`, `prisma/seed-notes/*.md`: 개발용 예시 데이터
- `src/lib/`: DB와 상관없는 코드 (`markdown.ts`: 목록용 요약문, `with-error-handling.ts`: API 공통 에러 처리)
- `src/server/`: 서버 전용 코드
  - `db.ts`: 앱 전체가 쓰는 Prisma 클라이언트 하나 (`server-only`, 개발 환경 SQL 로그)
  - `prisma-client.ts`: Prisma 클라이언트를 만드는 방법 (앱과 seed가 공유)
  - `notes/service.ts`: 노트 데이터 접근 (서비스). DB에서 무엇을 가져올지만 알고 HTTP는 모른다
    - 묶음 순서(`seriesOrder`)는 서버가 정한다: 넣으면 맨 뒤, 빠지면(삭제, 이동, 빼기) 뒤 번호를 당겨 항상 1, 2, 3처럼 빈틈없게. 묶음 생성(`upsert`)과 빈 묶음 삭제도 같은 곳에서 한다. 여러 단계를 바꾸는 작업은 `prisma.$transaction`으로 묶는다
  - `notes/schema.ts`: 노트 API가 받는 입력 규칙 (zod). 숫자 제한은 `schema.prisma`와 맞춘다
  - `series/service.ts`, `series/schema.ts`: 묶음(series) 조회
  - 도메인(notes, series 등)마다 폴더를 두고 `service.ts`와 `schema.ts`로 나눈다
  - **목록에서 관계된 개수나 데이터를 반복문으로 하나씩 조회하지 않는다 (N+1 문제).** `_count`, `select`/`include`로 한 번에 가져온다
  - URL id 검사는 `idSchema("노트")`처럼 `src/lib/id-schema.ts`를 쓴다

## 규칙

- 기본은 서버 컴포넌트다. `"use client"`는 상태나 브라우저 API가 필요한 말단 컴포넌트에만 붙인다
- 스타일은 Tailwind 클래스로만 작성한다. 마크다운 본문은 `prose`(typography 플러그인)를 쓴다
- import 경로는 `@/` 별칭을 쓴다. 같은 폴더나 `_components/`는 `./`로 쓴다
- import 순서: 외부 패키지 → `@/` → `./`, 그룹 사이에 빈 줄
- 노트의 정렬과 화면에 보이는 날짜는 **작성 시각(`createdAt`)** 기준이다. 수정해도 순서가 바뀌지 않는다 (`updatedAt`은 기록용으로만 둔다)
- 날짜 표시는 `src/lib/format.ts`의 `formatDate`를 쓴다. `Intl.DateTimeFormat`을 직접 만들지 않는다 (서버 시간대가 UTC라 `timeZone: "Asia/Seoul"` 지정이 필요)
- 브랜치는 `feat/...`, `fix/...`, `chore/...`로 따고 `main`에 합친다
- 커밋 메시지는 Conventional Commits 형식으로 쓰고 내용은 한국어로 쓴다 (예: `feat: 노트 목록 사이드바 추가`)

## 문서 동기화

- 방향, 범위, 기술 선택, 구조가 바뀌거나 기능을 끝내면 같은 작업 안에서 `docs/roadmap.md`(체크리스트, 단계)와 이 파일을 함께 고친다
- 문서만 고칠 때는 `docs:` 커밋으로 따로 남긴다
