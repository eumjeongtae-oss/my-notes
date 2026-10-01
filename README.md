# my-notes

velog 형식의 화면으로 나만 보는 개인 마크다운 노트 앱.

계획과 진행 상황은 [docs/roadmap.md](docs/roadmap.md)에 정리한다.

## 구조

pnpm workspace 모노레포다. 저장소는 하나, 앱은 `apps/` 아래에 있다.

| 폴더       | 역할                       | 포트 |
| ---------- | -------------------------- | ---- |
| `apps/web` | 프론트 (Next.js)           | 3000 |
| `apps/api` | 백엔드 (Next.js, REST API) | 4000 |

## 준비물

- Node.js, pnpm
- Docker Desktop (로컬 MySQL 8 실행용)

## 실행

모든 명령은 저장소 루트에서 실행한다.

```bash
pnpm install

# 환경 변수 파일을 만들고 값을 채운다 (DB 비밀번호는 루트와 api에 같은 값)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 로컬 MySQL 실행 (healthy가 될 때까지 기다린다)
docker compose up -d --wait

# 테이블 만들고 예시 데이터 넣기
pnpm db:migrate
pnpm db:seed

# MySQL을 먼저 띄운 뒤(predev) 웹과 백엔드를 실행한다
pnpm dev
```

> Docker Desktop이 켜져 있어야 한다. 꺼져 있으면 `pnpm dev`가 시작하자마자 에러로 멈춘다.

프론트는 [http://localhost:3000](http://localhost:3000), 백엔드 헬스체크는 [http://localhost:4000/api/health](http://localhost:4000/api/health)에서 확인한다.

## 자주 쓰는 명령어

| 명령어                         | 설명                               |
| ------------------------------ | ---------------------------------- |
| `pnpm dev`                     | 모든 앱 개발 서버 실행             |
| `pnpm typecheck` / `pnpm lint` | 모든 앱 타입 검사 / 린트           |
| `docker compose ps`            | MySQL 컨테이너 상태 확인           |
| `docker compose down`          | MySQL 중지 (데이터는 유지)         |
| `docker compose down -v`       | MySQL 중지하고 **데이터까지 삭제** |
| `pnpm db:studio`               | 브라우저에서 DB 내용 보기          |
| `pnpm db:seed`                 | 예시 데이터로 초기화               |
