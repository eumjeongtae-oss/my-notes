# 백엔드(apps/api) 배포용 이미지.
# 저장소 루트에서 빌드한다 (모노레포라서 루트의 pnpm-lock.yaml, pnpm-workspace.yaml이 필요하다):
#   docker build -f apps/api/Dockerfile -t my-notes-api .
#
# 3단계(multi-stage)로 나눈다. 앞 단계(deps, builder)는 빌드에만 쓰고 버린다.
# 최종 이미지(runner)에는 standalone 폴더만 담아서 작고, 소스 코드와 빌드 도구가 없다.

# ---------- 공통 바탕: Node 24 + pnpm ----------
# alpine: 아주 작은 리눅스 (일반 Node 이미지의 1/5 정도)
FROM node:24-alpine AS base
# corepack: Node에 들어 있는 패키지 매니저 관리 도구. package.json의 packageManager(pnpm@9.15.9)와 같은 버전을 쓴다
RUN corepack enable
WORKDIR /app

# ---------- 1단계 deps: 라이브러리 설치 ----------
FROM base AS deps
# 설치에 필요한 파일만 먼저 복사한다.
# Docker는 단계마다 결과를 기억(캐시)해서, 이 파일들이 그대로면 소스만 고쳤을 때 설치를 건너뛴다
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
# api의 postinstall이 prisma generate(클라이언트 코드 생성)를 실행하므로 스키마와 설정도 필요하다
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma7.config.ts ./apps/api/
# --frozen-lockfile: pnpm-lock.yaml과 다르게 설치하지 않는다 (내 컴퓨터와 같은 버전 보장)
# --filter api: web의 라이브러리는 설치하지 않는다
RUN pnpm install --frozen-lockfile --filter api

# ---------- 2단계 builder: 빌드 ----------
FROM base AS builder
COPY --from=deps /app ./
COPY apps/api ./apps/api
ENV NEXT_TELEMETRY_DISABLED=1
# next build는 API 파일을 한 번 불러와 보는데, 그때 db.ts가 DATABASE_URL이 없으면 에러를 낸다.
# 빌드 중에는 DB에 접속하지 않으므로 형식만 맞는 가짜 주소를 준다 (이 단계에만 있고 최종 이미지에는 없다).
# 진짜 주소는 컨테이너를 실행할 때 환경 변수로 넣는다
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" pnpm --filter api build

# ---------- 3단계 runner: 실제로 실행할 최종 이미지 ----------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 컨테이너 밖(다른 컨테이너, EC2)에서 접속할 수 있게 모든 주소에서 받는다. 기본값은 컨테이너 자신만
ENV HOSTNAME=0.0.0.0
ENV PORT=4000

# root가 아닌 사용자로 실행한다. 앱이 뚫려도 컨테이너 안에서 할 수 있는 일이 줄어든다
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
# standalone 폴더만 가져온다 (저장소와 같은 모양: node_modules/, apps/api/server.js)
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/.next/standalone ./
USER nextjs

EXPOSE 4000
CMD ["node", "apps/api/server.js"]
