// 로그인 세션 (서비스). "이 쿠키를 가진 브라우저는 이 사용자"라는 기록을 만들고, 확인하고, 지운다.
// 쿠키를 읽고 쓰는 건 HTTP 일이라 여기서는 하지 않는다. 토큰(문자열)만 주고받는다.
//
// 흐름:
//   로그인     → createSession(userId) → 토큰을 쿠키에 넣는다
//   요청마다   → validateSessionToken(쿠키의 토큰) → 사용자 또는 null
//   로그아웃   → invalidateSession(쿠키의 토큰)
import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../db";

const DAY = 24 * 60 * 60 * 1000;
// 로그인 유지 기간
const SESSION_DURATION = 30 * DAY;
// 남은 기간이 이보다 짧아지면 다시 30일로 늘린다. 자주 쓰는 사람은 로그인이 풀리지 않는다
const RENEW_BEFORE = 15 * DAY;

// 세션 토큰: 쿠키에 넣을 무작위 문자열.
// 32바이트(256비트)는 맞히는 게 사실상 불가능한 크기다. Math.random()은 예측할 수 있어서 쓰면 안 된다
function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

// 토큰 → DB에 저장할 세션 id (SHA-256, 64글자).
// 같은 토큰은 항상 같은 값이 되지만, 이 값에서 토큰을 거꾸로 알아낼 수는 없다
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// 로그인한 사용자 정보 중 API에서 쓸 칸
const sessionUserSelect = {
  id: true,
  email: true,
  name: true,
  picture: true,
  canUploadImages: true,
} as const;

// 새 세션을 만든다. 돌려주는 token은 쿠키에 넣을 원본이다. DB에는 바꾼 값(hash)만 들어간다
export async function createSession(userId: number) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  await prisma.session.create({
    data: { id: hashToken(token), userId, expiresAt },
  });
  return { token, expiresAt };
}

// 쿠키의 토큰으로 세션을 확인한다.
//   유효하면  → { user, expiresAt } (기한이 늘었으면 expiresAt도 새 값. 쿠키 기한도 같이 늘려야 한다)
//   아니면    → null (없는 토큰, 기한 지남)
export async function validateSessionToken(token: string) {
  const sessionId = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { expiresAt: true, user: { select: sessionUserSelect } },
  });
  if (!session) return null;

  const now = Date.now();
  // 기한이 지났으면 지우고 로그인 안 한 것으로 본다
  if (session.expiresAt.getTime() <= now) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  // 기한이 얼마 안 남았으면 늘린다
  if (session.expiresAt.getTime() - now < RENEW_BEFORE) {
    const expiresAt = new Date(now + SESSION_DURATION);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt },
    });
    return { user: session.user, expiresAt };
  }

  return { user: session.user, expiresAt: session.expiresAt };
}

// 로그아웃. 이미 없는 세션이어도 에러 없이 끝난다 (deleteMany는 0개를 지워도 괜찮다)
export async function invalidateSession(token: string) {
  await prisma.session.deleteMany({ where: { id: hashToken(token) } });
}

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof validateSessionToken>>
>["user"];
