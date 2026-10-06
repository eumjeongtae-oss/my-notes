# 프론트(apps/web) 배포용 이미지.
# 저장소 루트에서 빌드한다. 브라우저가 부를 api 주소를 빌드할 때 넣어야 한다 (아래 ARG 설명):
#   docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:4001 -t my-notes-web .
#
# 구조는 apps/api/Dockerfile과 같다 (deps → builder → runner). 다른 점만 주석으로 적는다.

# ---------- 공통 바탕: Node 24 + pnpm ----------
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- 1단계 deps: 라이브러리 설치 ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter web

# ---------- 2단계 builder: 빌드 ----------
FROM base AS builder
COPY --from=deps /app ./
COPY apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_으로 시작하는 값은 next build 때 브라우저 코드 안에 글자 그대로 박힌다.
# 실행할 때 환경 변수로 바꿔도 이미 박힌 글자는 안 바뀌므로, 빌드할 때 --build-arg로 받는다.
# (누구나 볼 수 있는 값이라 이미지에 들어가도 괜찮다. 비밀 값은 절대 NEXT_PUBLIC_으로 만들지 않는다)
ARG NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "--build-arg NEXT_PUBLIC_API_URL=... 이 필요합니다" && exit 1)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter web build

# ---------- 3단계 runner: 실제로 실행할 최종 이미지 ----------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
# API_URL(서버 컴포넌트가 부를 api 주소)은 NEXT_PUBLIC_이 아니라서 실행할 때 읽는다 → docker run -e API_URL=...

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# standalone은 정적 파일(화면용 JS, CSS, 폰트)과 public 폴더를 복사하지 않는다 (원래는 CDN이 맡는 부분).
# 우리는 CDN 없이 Next 서버가 직접 보내므로 직접 넣어 준다
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
