# my-notes

velog 형식의 화면으로 나만 보는 개인 마크다운 노트 앱.

계획과 진행 상황은 [docs/roadmap.md](docs/roadmap.md)에 정리한다.

## 구조

pnpm workspace 모노레포다. 저장소는 하나, 앱은 `apps/` 아래에 있다.

| 폴더       | 역할                         | 포트 |
| ---------- | ---------------------------- | ---- |
| `apps/web` | 프론트 (Next.js)             | 3000 |
| `apps/api` | 백엔드 (Next.js) — 추가 예정 | 4000 |

## 준비물

- Node.js, pnpm
- Docker Desktop (로컬 MySQL 8 실행용)

## 실행

모든 명령은 저장소 루트에서 실행한다.

```bash
pnpm install

# 환경 변수 파일을 만들고 값을 채운다 (비밀번호는 두 파일에 같은 값)
cp .env.example .env
cp apps/web/.env.example apps/web/.env

# 로컬 MySQL 실행 (healthy가 될 때까지 기다린다)
docker compose up -d --wait

# 테이블 만들고 예시 데이터 넣기
pnpm --filter web exec prisma migrate dev
pnpm --filter web exec prisma db seed

pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인한다.

## 자주 쓰는 명령어

| 명령어                                  | 설명                               |
| --------------------------------------- | ---------------------------------- |
| `pnpm dev`                              | 모든 앱 개발 서버 실행             |
| `pnpm typecheck` / `pnpm lint`          | 모든 앱 타입 검사 / 린트           |
| `docker compose ps`                     | MySQL 컨테이너 상태 확인           |
| `docker compose down`                   | MySQL 중지 (데이터는 유지)         |
| `docker compose down -v`                | MySQL 중지하고 **데이터까지 삭제** |
| `pnpm --filter web exec prisma studio`  | 브라우저에서 DB 내용 보기          |
| `pnpm --filter web exec prisma db seed` | 예시 데이터로 초기화               |
