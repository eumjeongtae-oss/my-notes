@apps/web/AGENTS.md

# my-notes

velog 형식의 화면으로 나만 보는 개인 마크다운 노트 앱. 계획과 진행 상황은 `docs/roadmap.md`에 있다.

## 아키텍처

회사처럼 프론트와 백엔드를 나눈다. **pnpm workspace 모노레포**로 저장소는 하나, 앱은 둘이다.

- `apps/web`: 프론트 Next.js (포트 3000). 화면만 담당하고 **DB나 백엔드 코드를 import하지 않는다.** 데이터는 오직 REST API로 주고받는다
- `apps/api`: 백엔드 Next.js (포트 4000). Route Handler로 REST API를 만들고 Prisma로 MySQL에 접근한다

> 🚧 전환 중 (`chore/monorepo` 브랜치): 지금은 `apps/web`만 있고, Prisma와 DB 코드도 임시로 `apps/web`에 있다. 다음 단계에서 `apps/api`를 만들고 옮긴다.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, pnpm
- DB는 MySQL 8, ORM은 Prisma다 (팀 프로젝트와 같은 스택이라 선택. 다른 DB나 ORM을 제안하지 않는다)
- 개발용 MySQL은 Docker Compose로 로컬에서 띄운다

## 명령어

모든 명령은 **저장소 루트**에서 실행한다. 특정 앱에서만 실행하려면 `pnpm --filter web ...`을 쓴다.

- `docker compose up -d --wait`: 로컬 MySQL 실행 (`docker compose down`으로 중지, `down -v`는 데이터까지 삭제)
- `pnpm dev`: 모든 앱의 개발 서버 실행 (web: http://localhost:3000)
- `pnpm build` / `pnpm lint` / `pnpm typecheck`: 모든 앱에서 빌드, 린트, 타입 검사
- `pnpm format` / `pnpm format:check`: 저장소 전체 Prettier (Tailwind 클래스 자동 정렬 포함)
- `pnpm --filter web exec prisma migrate dev --name 변경내용`: 마이그레이션 만들고 DB에 반영. 이후 `pnpm --filter web exec prisma generate` (Prisma 7은 자동 생성하지 않음)
- `pnpm --filter web exec prisma db seed`: 개발용 예시 데이터로 초기화 (기존 데이터 삭제됨)
- `pnpm --filter web exec prisma studio`: 브라우저에서 DB 내용 보기

작업을 마치면 `typecheck`, `lint`, `format:check`, `build`를 통과시킨다.

## 환경 변수

앱마다 자기 `.env`를 가진다 (회사에서 레포마다 따로 있는 것과 같다). 각 폴더의 `.env.example`을 복사해서 만든다.

- 루트 `.env`: MySQL 컨테이너 설정 (`compose.yaml`이 읽음)
- `apps/web/.env`: `DATABASE_URL` (임시. `apps/api`로 옮길 예정)

## 구조

아래 경로는 `apps/web/` 기준이다.

- `src/app/(main)/`: 헤더가 있는 화면들 (홈, 읽기). 라우트 그룹이라 URL에는 나타나지 않음
- 화면은 velog 모티브: 카드 목록 홈, 읽기 페이지, 헤더 없는 전체 화면 글쓰기(`/write`, 왼쪽 에디터 + 오른쪽 미리보기)
- 컴포넌트 위치는 colocation 방식이다 (파일명은 kebab-case, export는 named export)
  - 한 라우트(그룹)에서만 쓰면 그 폴더의 `_components/`에 둔다 (예: `src/app/(main)/_components/header.tsx`). `_`로 시작하는 폴더는 라우팅에서 제외된다
  - 여러 라우트에서 같이 쓰면 `src/components/`에 둔다 (예: `markdown-preview.tsx`)
  - 한 곳에서만 쓰던 컴포넌트를 다른 라우트에서도 쓰게 되면 `src/components/`로 옮긴다
- `prisma/schema.prisma`: DB 설계도(모델). 설정은 `prisma7.config.ts`, 생성 코드는 `src/generated/prisma`(git 제외)
- `src/server/`: **서버 전용 코드** (DB 접근). 클라이언트 컴포넌트에서 import하지 않는다
  - `db.ts`: 앱 전체가 쓰는 Prisma 클라이언트 하나 (`server-only`, 개발 환경 SQL 로그)
  - `prisma-client.ts`: Prisma 클라이언트를 만드는 방법 (앱과 seed가 공유)
  - `notes.ts`: 노트 데이터 접근 계층. 화면은 여기 함수만 호출하고 `prisma`를 직접 쓰지 않는다
- `src/lib/`: 서버와 브라우저 어디서나 쓰는 순수 함수 (`format.ts`, `markdown.ts` 등)

## 규칙

- 기본은 서버 컴포넌트다. `"use client"`는 상태나 브라우저 API가 필요한 말단 컴포넌트에만 붙인다
- 스타일은 Tailwind 클래스로만 작성한다. 마크다운 본문은 `prose`(typography 플러그인)를 쓴다
- import 경로는 `@/` 별칭을 쓴다. 같은 폴더나 `_components/`는 `./`로 쓴다
- import 순서: 외부 패키지 → `@/` → `./`, 그룹 사이에 빈 줄
- 날짜 표시는 `src/lib/format.ts`의 `formatDate`를 쓴다. `Intl.DateTimeFormat`을 직접 만들지 않는다 (서버 시간대가 UTC라 `timeZone: "Asia/Seoul"` 지정이 필요)
- 브랜치는 `feat/...`, `fix/...`, `chore/...`로 따고 `main`에 합친다
- 커밋 메시지는 Conventional Commits 형식으로 쓰고 내용은 한국어로 쓴다 (예: `feat: 노트 목록 사이드바 추가`)

## 문서 동기화

- 방향, 범위, 기술 선택, 구조가 바뀌거나 기능을 끝내면 같은 작업 안에서 `docs/roadmap.md`(체크리스트, 단계)와 이 파일을 함께 고친다
- 문서만 고칠 때는 `docs:` 커밋으로 따로 남긴다
