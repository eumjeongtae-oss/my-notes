# my-notes

velog 형식의 화면으로 나만 보는 개인 마크다운 노트 앱.

계획과 진행 상황은 [docs/roadmap.md](docs/roadmap.md)에 정리한다.

## 준비물

- Node.js, pnpm
- Docker Desktop (로컬 MySQL 8 실행용)

## 실행

```bash
pnpm install

# 환경 변수 파일을 만들고 MYSQL_ROOT_PASSWORD를 채운다
cp .env.example .env

# 로컬 MySQL 실행 (healthy가 될 때까지 기다린다)
docker compose up -d --wait

# 테이블 만들고 예시 데이터 넣기
pnpm prisma migrate dev
pnpm prisma db seed

pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인한다.

## 자주 쓰는 명령어

| 명령어                      | 설명                               |
| --------------------------- | ---------------------------------- |
| `docker compose ps`         | MySQL 컨테이너 상태 확인           |
| `docker compose logs mysql` | MySQL 로그 보기                    |
| `docker compose down`       | MySQL 중지 (데이터는 유지)         |
| `docker compose down -v`    | MySQL 중지하고 **데이터까지 삭제** |
| `pnpm prisma studio`        | 브라우저에서 DB 내용 보기          |
| `pnpm prisma db seed`       | 예시 데이터로 초기화               |
