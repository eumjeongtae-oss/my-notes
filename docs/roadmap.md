# my-notes 로드맵

velog 형식의 화면으로 쓰는 개인 마크다운 노트 앱. 누구나 Google로 가입할 수 있고, 각자 자기 노트만 본다.
Next.js, Tailwind, 백엔드, AWS 배포를 실무 방식으로 익히는 것이 목표다.

## 구조

회사처럼 프론트와 백엔드를 나눈다. 저장소는 하나(pnpm workspace 모노레포), 앱은 둘이다.

```
apps/web  프론트 Next.js (포트 3000)  화면만. DB를 모르고 REST API만 호출한다
apps/api  백엔드 Next.js (포트 4000)  REST API, Prisma, MySQL
```

## 기술 스택

| 역할          | 선택                                                                  |
| ------------- | --------------------------------------------------------------------- |
| 프론트        | Next.js 16 (App Router), React 19, TypeScript (`apps/web`)            |
| 백엔드        | Next.js 16 Route Handler로 REST API (`apps/api`)                      |
| 스타일        | Tailwind CSS 4, @tailwindcss/typography                               |
| 에디터        | CodeMirror 6 + react-markdown (remark-gfm)                            |
| DB            | MySQL 8 (개발은 Docker Compose로 로컬 실행, 배포는 EC2 안의 컨테이너) |
| ORM           | Prisma (팀 프로젝트와 같은 스택)                                      |
| 로그인        | Google 로그인 (누구나 가입), arctic + DB 세션                         |
| 이미지 저장   | AWS S3 (업로드 권한이 있는 사용자만)                                  |
| 배포          | AWS EC2 + Docker Compose, Caddy(HTTPS), GHCR, GitHub Actions          |
| 패키지 매니저 | pnpm                                                                  |

## MVP 범위

- [x] 홈 노트 목록 (목록형 하나, 정렬. 카드형 보기는 2026-10-01에 단순화하며 삭제)
- [x] 노트 읽기 페이지
- [x] 글쓰기 화면 (`/write` 새 노트, `/write?id=1` 수정. 헤더 없는 전체 화면, 왼쪽 에디터 + 오른쪽 미리보기)
- [x] 마크다운 에디터와 미리보기
- [x] 에디터 서식 툴바 (제목, 굵게, 기울임, 취소선, 인용, 링크, 이미지 주소, 코드 블록)
- [x] 노트 저장 / 수정 / 삭제 (삭제 확인 창, 성공 토스트)
- [x] 저장할 때 묶음 입력 (velog처럼 새 이름이면 묶음이 자동으로 생기고, 마지막 노트가 빠지면 자동으로 사라짐. 묶음을 따로 만들고 지우는 화면은 없음)
- [x] 로딩 스켈레톤 UI (홈, 읽기, 묶음 목록, 묶음 상세, 글쓰기)
- [x] 404 화면 (헤더 안 / 헤더 없는 두 종류)과 글쓰기 에러 화면
- [x] 홈 목록 무한스크롤 (전체 개수, 헤더 고정, 맨 위로 버튼)
- [x] 노트 검색 (제목, 본문 LIKE 검색, 디바운스, URL ?q=)
- [x] 묶음 (velog의 시리즈처럼 노트를 순서대로 묶기: 홈의 묶음 탭, 묶음 상세)
- [x] 구글 로그인 (누구나 가입, 각자 자기 노트와 묶음만 보고 고침)
- [x] 로그아웃 (헤더의 프로필 사진 메뉴. 마이페이지 대신)
- [ ] 이미지 업로드 (S3, 툴바 버튼 + 드래그/붙여넣기. 업로드 권한(`canUploadImages`)이 있는 사용자만, 한 장 5MB와 사람별 용량 제한)
- [ ] 목록 썸네일 (본문의 첫 이미지)

## 이후 기능

태그, 목차, 검색이 느려지면 MySQL ngram 전문 검색으로 전환 (LIKE는 인덱스를 못 씀, ngram은 한 글자 검색 불가), 자동저장, 다크모드, 에디터 단축키, 에디터 표 삽입 버튼 (2열 2행 기본 표, 첫 칸 선택), 읽기 페이지의 묶음 이전/다음 노트, 묶음 안에서 순서 바꾸기, 노트 고정 (DB 칸 `pinned`는 이미 있음), 마이페이지(프로필), velog처럼 노트 공개(작성자 페이지), 이미지 권한 관리 화면, 로그인 후 원래 가려던 페이지로 돌아가기(지금은 항상 홈), 로그인된 기기 목록과 다른 기기 로그아웃

## 단계

1. ✅ **화면**: 가짜 데이터로 velog식 홈, 읽기, 글쓰기 UI 만들기
2. ✅ **DB와 API**: MySQL 8 + Prisma, 프론트/백엔드 분리
   1. ✅ Docker로 MySQL 실행, Prisma 설정, 테이블 설계 (`notes`, `series`), seed
   2. ✅ 모노레포로 전환: 지금 앱을 `apps/web`으로, 백엔드 `apps/api` 추가, DB 코드를 `apps/api`로 이동
   3. ✅ 조회 API (`GET /api/notes/:id`, `GET /api/notes`) → 프론트 읽기/홈 연결
      - 백엔드가 꺼졌을 때 에러 화면 (`error.tsx`)
      - 로딩 중 스켈레톤 UI (`loading.tsx`, 홈 카드와 읽기 페이지 모양)
   4. ✅ 저장 / 수정 / 삭제 API (묶음 선택은 7번 묶음 단계로) (`POST`, `PATCH`, `DELETE`, zod 입력 검증). 브라우저가 직접 호출하므로 React Query 도입, CORS 설정
   5. ✅ 홈 목록 무한스크롤 (커서 페이지네이션 API, useInfiniteQuery, IntersectionObserver). 끝에 닿기 전에 미리 불러오기(rootMargin 약 600px), 불러오는 중에는 아래에 스켈레톤 카드
   6. ✅ 검색 (제목, 본문 LIKE. ngram 전문 검색은 노트가 많아져 느려지면)
   7. ✅ 묶음 화면 (홈 탭, 묶음 상세) + 저장할 때 묶음 이름 입력 (자동 생성, 빈 묶음 자동 삭제). 이전/다음 노트와 순서 바꾸기는 이후 기능으로
3. ✅ **로그인 (여러 사용자)**: 백엔드가 Google 로그인을 처리하고(arctic), 세션은 DB에 저장해서 쿠키로 유지. 누구나 가입
   1. ✅ Google Cloud Console에서 OAuth 클라이언트 만들기, `.env`에 넣기
   2. ✅ DB: `User`(이미지 권한 `canUploadImages`), `Session` 테이블 추가
   3. ✅ 로그인/콜백/로그아웃/내 정보 API. `ADMIN_EMAILS`의 이메일은 처음 가입할 때 이미지 권한을 켠다
   4. ✅ 노트와 묶음에 주인(`userId`) 추가 (기존 노트는 첫 사용자에게 옮기는 데이터 마이그레이션, 묶음 이름은 사람마다 하나), 모든 노트, 묶음 API를 로그인한 사람의 것만 다루게 보호 (남의 노트 id는 404)
   5. ✅ web: 쿠키 전달 (브라우저 요청, 서버 컴포넌트), 로그인 페이지, 헤더의 프로필 메뉴와 로그아웃
4. **배포**: 프론트와 백엔드를 각각 Docker 이미지로, EC2, 배포용 DB, GitHub Actions, 도메인과 HTTPS. AWS Budgets 알림, 개인정보 처리방침 페이지, Google 앱 게시(테스트 → 프로덕션)
   - 구성: EC2 한 대(t3.small)에 Docker Compose로 Caddy(HTTPS 자동) + web + api + mysql. 주소는 `chagoknotes.com`(web), `api.chagoknotes.com`(api). `chagok.app` 등 짧은 이름은 이미 주인이 있었다
   - DB는 RDS(월 $20 이상) 대신 EC2 안의 MySQL 컨테이너. 대신 매일 백업을 S3로. 예상 비용 월 약 $25 + 도메인
   - GitHub 레포: https://github.com/eumjeongtae-oss/my-notes (공개). 커밋 이메일은 GitHub noreply 주소
   1. ✅ api Docker 이미지 (`output: "standalone"`, multi-stage, root가 아닌 사용자)
   2. ✅ web Docker 이미지 (`NEXT_PUBLIC_API_URL`은 빌드할 때 코드에 박혀서 `--build-arg`로 받는다, `.next/static`과 `public`은 직접 복사)
   3. ✅ 배포용 `compose.prod.yaml`로 web + api + mysql 함께 띄우기, 켤 때마다 마이그레이션 자동 실행(`migrate` 서비스), 앱 전용 DB 계정. 로컬에서 로그인까지 확인(Google Console에 `http://localhost:4001/...` 리디렉션 URI 추가), 개발 DB의 노트를 덤프 → 복원으로 옮기는 연습 (4-7에서 라이브로 옮긴다)
   4. ✅ 쿠키 도메인(`COOKIE_DOMAIN`): `api.` 주소가 만든 세션 쿠키를 web 주소에서도 보이게 (로컬은 비워 둔다)
   5. ✅ AWS 계정(**무료 플랜**: 6개월, 크레딧 최대 $200 안에서는 청구 자체가 안 됨. 6개월 뒤 유료 전환), MFA, 지출 한도. 체크카드면 카드사 앱에서 해외결제 한도도 낮게
      - ✅ 가입 (2026-10-07, 무료 플랜 크레딧 $100, 2027-04-07까지)
      - ✅ 상한선: 무료 플랜에는 지출 한도 설정이 없고 무료 플랜 자체가 상한선(청구 0원)이다. **2027-04-07 전에 유료로 바꿀 때 지출 한도(월 $30~40)를 건다.** 크레딧 사용량은 `settings.aws.com`의 "청구 → 프로젝트별 비용"에서 본다
      - 서버는 자동으로 만들어진 프로젝트 "Touch Grass Later" 안에 만든다
      - 계정이 AWS의 **새 간소화 버전**(프로젝트, 팀, AWS Builder ID 로그인)으로 만들어졌다. 루트 사용자 대신 Builder ID로 로그인하고, 설정은 `https://settings.aws.com`에서 한다. 이 버전에는 **지출 한도(spend limit)**가 있어 무료 플랜이 끝난 뒤에도 상한선으로 쓴다
      - **"고급 기능 활성화"는 하지 않는다**: 유료 플랜이 필요하고, 지출 한도가 사라지며, 되돌릴 수 없다. EC2 + Docker 계획에는 필요 없다 (EC2를 만들 때 간소화 버전에서 되는지 확인)
      - ✅ Builder ID MFA (인증 앱). 가입 직후 `profile.aws.amazon.com`, `settings.aws.com`이 `ERR-837 계정 문제`로 열리지 않음 → 계정 확인이 끝나기를 기다렸다가 다시 시도, 계속되면 AWS Support(무료)에 요청 ID와 함께 문의
      - MFA를 켜기 전에는 EC2(과금 리소스)를 만들지 않는다
   6. 도메인 `chagoknotes.com` 구입 (무료 플랜은 구매가 막힐 수 있어 AWS 밖, Cloudflare 등에서 연 $10 정도), DNS 연결
   7. EC2 만들기(보안 그룹, 고정 IP, Docker), 손으로 처음 배포
   8. Caddy로 HTTPS, Google Console에 운영 리디렉션 URI 추가
   9. GitHub Actions 자동 배포 (이미지 빌드 → GHCR → EC2)
   10. DB 매일 백업 → S3
   11. 개인정보 처리방침 페이지, Google 앱 게시(테스트 → 프로덕션)
5. **이미지**: S3 업로드 (Presigned URL). 업로드 권한이 있는 사용자만, 한 장 5MB와 사람별 용량 제한. 툴바 이미지 버튼을 파일 선택 업로드로 바꾸고, 드래그/붙여넣기 업로드와 카드 썸네일 추가. 이미지 없이 먼저 배포해서 완성된 앱을 올려 두려고 배포 뒤로 미뤘다
6. **품질**: 테스트(Vitest, Playwright), PR마다 CI 검사

## 작업 규칙

- 기능마다 브랜치를 따서 작업한다 (`feat/...`, `fix/...`, `chore/...`)
- 작게 커밋하고, PR로 `main`에 합친다
- **프론트(`apps/web`)는 DB나 백엔드 코드를 import하지 않는다.** 데이터는 오직 API로 주고받는다
- **로그인(3단계) 전에는 배포하지 않는다.** 로그인 없이 배포하면 누구나 노트를 보고 고칠 수 있다
- **모든 노트, 묶음 조회와 수정은 로그인한 사용자(`userId`) 조건을 붙인다.** 남의 데이터가 보이면 가장 큰 사고다
- AWS 계정을 만들면 **Budgets 결제 알림부터** 설정한다
