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
// 로그인 유지 기간. 로그인한 순간부터 30일이 지나면 매일 써도 다시 로그인해야 한다 (연장하지 않는다).
// 그래서 쓰는 사람은 적어도 30일에 한 번 로그인 화면을 거치고, 그때 오래된 세션이 정리된다
const SESSION_DURATION = 30 * DAY;

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
//   유효하면  → 사용자 정보
//   아니면    → null (없는 토큰, 기한 지남)
export async function validateSessionToken(token: string) {
  const sessionId = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { expiresAt: true, user: { select: sessionUserSelect } },
  });
  if (!session) return null;

  // 기한이 지났으면 지우고 로그인 안 한 것으로 본다
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session.user;
}

// 로그아웃. 이미 없는 세션이어도 에러 없이 끝난다 (deleteMany는 0개를 지워도 괜찮다)
export async function invalidateSession(token: string) {
  await prisma.session.deleteMany({ where: { id: hashToken(token) } });
}

// 이 사용자의 기한 지난 세션을 모두 지운다. 로그인할 때 부른다.
// 쿠키를 지웠거나, 시크릿 창을 닫았거나, 안 쓰는 기기에 남은 세션은 그 토큰으로 요청이 다시 오지 않아서
// validateSessionToken이 지울 기회가 없다. 그래서 로그인할 때 한꺼번에 청소한다
// SQL: DELETE FROM sessions WHERE user_id = ? AND expires_at <= NOW()
export async function deleteExpiredSessions(userId: number) {
  await prisma.session.deleteMany({
    where: { userId, expiresAt: { lte: new Date() } },
  });
}

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof validateSessionToken>>
>;
