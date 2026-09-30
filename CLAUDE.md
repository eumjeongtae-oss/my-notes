@AGENTS.md

# my-notes

노션처럼 나만 보는 개인 마크다운 노트 앱. 계획과 진행 상황은 `docs/roadmap.md`에 있다.

## 명령어

- `pnpm dev`: 개발 서버 (http://localhost:3000)
- `pnpm build`: 프로덕션 빌드
- `pnpm lint`: ESLint
- `pnpm format` / `pnpm format:check`: Prettier (Tailwind 클래스 자동 정렬 포함)
- `pnpm tsc --noEmit`: 타입 검사. `PageProps`, `LayoutProps` 타입이 없다고 나오면 `pnpm next typegen`을 먼저 실행한다

작업을 마치면 `tsc`, `lint`, `format:check`, `build`를 통과시킨다.

## 구조

- `src/app/(notes)/`: 사이드바가 있는 화면들 (라우트 그룹이라 URL에는 나타나지 않음)
- `src/components/`: 화면 컴포넌트 (파일명은 kebab-case, export는 named export)
- `src/lib/notes.ts`: 노트 데이터 접근 계층. 화면은 여기 함수만 호출하고 DB를 직접 건드리지 않는다

## 규칙

- 기본은 서버 컴포넌트다. `"use client"`는 상태나 브라우저 API가 필요한 말단 컴포넌트에만 붙인다
- 스타일은 Tailwind 클래스로만 작성한다. 마크다운 본문은 `prose`(typography 플러그인)를 쓴다
- import 경로는 `@/` 별칭을 쓴다 (같은 폴더는 `./`)
- 브랜치는 `feat/...`, `fix/...`, `chore/...`로 따고 `main`에 합친다
- 커밋 메시지는 Conventional Commits 형식으로 쓰고 내용은 한국어로 쓴다 (예: `feat: 노트 목록 사이드바 추가`)
