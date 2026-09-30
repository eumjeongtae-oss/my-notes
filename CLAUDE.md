@AGENTS.md

# my-notes

velog 형식의 화면으로 나만 보는 개인 마크다운 노트 앱. 계획과 진행 상황은 `docs/roadmap.md`에 있다.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, pnpm
- DB는 MySQL 8, ORM은 Prisma다 (팀 프로젝트와 같은 스택이라 선택. 다른 DB나 ORM을 제안하지 않는다)
- 개발용 MySQL은 Docker Compose로 로컬에서 띄운다

## 명령어

- `pnpm dev`: 개발 서버 (http://localhost:3000)
- `pnpm build`: 프로덕션 빌드
- `pnpm lint`: ESLint
- `pnpm format` / `pnpm format:check`: Prettier (Tailwind 클래스 자동 정렬 포함)
- `pnpm tsc --noEmit`: 타입 검사. `PageProps`, `LayoutProps` 타입이 없다고 나오면 `pnpm next typegen`을 먼저 실행한다

작업을 마치면 `tsc`, `lint`, `format:check`, `build`를 통과시킨다.

## 구조

- `src/app/(main)/`: 헤더가 있는 화면들 (홈, 읽기). 라우트 그룹이라 URL에는 나타나지 않음
- 화면은 velog 모티브: 카드 목록 홈, 읽기 페이지, 헤더 없는 전체 화면 글쓰기(`/write`, 왼쪽 에디터 + 오른쪽 미리보기)
- 컴포넌트 위치는 colocation 방식이다 (파일명은 kebab-case, export는 named export)
  - 한 라우트(그룹)에서만 쓰면 그 폴더의 `_components/`에 둔다 (예: `src/app/(main)/_components/header.tsx`). `_`로 시작하는 폴더는 라우팅에서 제외된다
  - 여러 라우트에서 같이 쓰면 `src/components/`에 둔다 (예: `markdown-preview.tsx`)
  - 한 곳에서만 쓰던 컴포넌트를 다른 라우트에서도 쓰게 되면 `src/components/`로 옮긴다
- `src/lib/notes.ts`: 노트 데이터 접근 계층. 화면은 여기 함수만 호출하고 DB를 직접 건드리지 않는다

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
