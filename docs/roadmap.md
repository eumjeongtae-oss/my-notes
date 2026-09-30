# my-notes 로드맵

velog 형식의 화면으로 나만 보는 개인 마크다운 노트 앱.
Next.js, Tailwind, 백엔드, AWS 배포를 실무 방식으로 익히는 것이 목표다.

## 기술 스택

| 역할            | 선택                                                  |
| --------------- | ----------------------------------------------------- |
| 프론트 + 백엔드 | Next.js 16 (App Router, 풀스택), React 19, TypeScript |
| 스타일          | Tailwind CSS 4, @tailwindcss/typography               |
| 에디터          | CodeMirror 6 + react-markdown (remark-gfm)            |
| DB              | PostgreSQL (처음엔 Neon 무료, 이후 RDS 검토)          |
| ORM             | Drizzle 또는 Prisma (2단계에서 결정)                  |
| 로그인          | Auth.js + Google (내 이메일만 허용)                   |
| 이미지 저장     | AWS S3                                                |
| 배포            | AWS EC2 + Docker, GitHub Actions로 자동 배포          |
| 패키지 매니저   | pnpm                                                  |

## MVP 범위

- [ ] 구글 로그인 (허용된 이메일만)
- [x] 홈 노트 목록 (카드/목록 보기, 정렬)
- [x] 노트 읽기 페이지
- [ ] 글쓰기 화면 (`/write`, 헤더 없는 전체 화면, 왼쪽 에디터 + 오른쪽 미리보기)
- [x] 마크다운 에디터와 미리보기 (저장은 2단계에서)
- [ ] 노트 생성 / 수정 / 삭제
- [ ] 노트 검색
- [ ] 이미지 업로드 (S3)
- [ ] 마이페이지

## 이후 기능

폴더나 하위 페이지 구조, 태그, 자동저장, 다크모드

## 단계

1. **화면**: 가짜 데이터로 velog식 홈, 읽기, 글쓰기 UI 만들기 (글쓰기 남음)
2. **DB**: 노트를 실제로 저장하고 불러오기 (Server Actions, 입력 검증)
3. **로그인**: Auth.js + Google, 허용 이메일 체크
4. **이미지**: S3 업로드
5. **배포**: Docker, EC2, GitHub Actions, 도메인과 HTTPS
6. **품질**: 테스트(Vitest, Playwright), PR마다 CI 검사

## 작업 규칙

- 기능마다 브랜치를 따서 작업한다 (`feat/...`, `fix/...`, `chore/...`)
- 작게 커밋하고, PR로 `main`에 합친다
- AWS 계정을 만들면 **Budgets 결제 알림부터** 설정한다
