import { decodeIdToken, OAuth2RequestError } from "arctic";
import { z } from "zod";

import {
  getSessionToken,
  setSessionCookie,
  takeOAuthCookies,
} from "@/lib/auth-cookies";
import { withErrorHandling } from "@/lib/with-error-handling";
import { getGoogle, getWebUrl } from "@/server/auth/google";
import {
  createSession,
  deleteExpiredSessions,
  invalidateSession,
} from "@/server/auth/session";
import { upsertGoogleUser } from "@/server/users/service";

// Google이 준 사용자 정보(ID 토큰) 중 우리가 쓰는 칸. 모양이 다르면 로그인을 실패시킨다
const googleClaimsSchema = z.object({
  // Google 계정 고유 번호
  sub: z.string(),
  email: z.email(),
  // Google이 이메일 주인임을 확인했는지
  email_verified: z.boolean(),
  name: z.string().optional(),
  picture: z.string().optional(),
});

// 로그인 실패 → 프론트 로그인 페이지로 돌려보내고 이유를 ?error=로 알린다
function failRedirect(reason: string) {
  return Response.redirect(`${getWebUrl()}/login?error=${reason}`, 302);
}

// GET /api/auth/google/callback?code=...&state=...
// Google 로그인이 끝나면 Google이 사용자를 이 주소로 돌려보낸다 (Console에 등록한 리디렉션 URI).
//   302 → 프론트 홈: 로그인 성공. session 쿠키를 심는다
//   302 → 프론트 /login?error=...: 로그인 실패
export const GET = withErrorHandling(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");
  // 로그인 시작 때 쿠키에 보관한 값 (꺼내면서 쿠키는 지운다)
  const stored = await takeOAuthCookies();

  // 사용자가 Google 화면에서 "취소"를 누르면 code 없이 ?error=access_denied로 돌아온다
  if (!code || !state) return failRedirect("cancelled");
  // 내가 시작한 로그인이 아니거나, 10분이 지나 쿠키가 사라짐
  if (!stored.state || !stored.codeVerifier || state !== stored.state) {
    return failRedirect("invalid_state");
  }

  // 일회용 code + 보안 비밀번호 → Google 서버에서 사용자 정보(ID 토큰)로 바꾼다.
  // 브라우저를 거치지 않고 우리 서버와 Google 서버가 직접 주고받는다
  let idToken: string;
  try {
    const tokens = await getGoogle().validateAuthorizationCode(
      code,
      stored.codeVerifier,
    );
    idToken = tokens.idToken();
  } catch (error) {
    // code가 틀렸거나 이미 쓴 code (Google이 거절함). 그 밖의 에러는 withErrorHandling이 500으로
    if (error instanceof OAuth2RequestError) return failRedirect("google");
    throw error;
  }

  // ID 토큰은 Google 서버에서 직접 받은 것이라, 서명 검사 없이 내용을 꺼내 써도 된다
  const claims = googleClaimsSchema.safeParse(decodeIdToken(idToken));
  if (!claims.success || !claims.data.email_verified) {
    return failRedirect("google");
  }

  const { sub, email, name, picture } = claims.data;
  const user = await upsertGoogleUser({
    googleId: sub,
    email,
    // 이름이 없는 계정이면 이메일 앞부분을 쓴다. DB 칸(VARCHAR(100))에 맞게 자른다
    name: (name || email.split("@")[0]).slice(0, 100),
    picture: picture ?? null,
  });

  // 세션 정리 두 가지 (안 하면 다시 로그인할 때마다 세션이 쌓인다)
  // ① 이 브라우저에 예전 로그인 쿠키가 있으면 그 세션을 지운다. 새 쿠키로 덮어쓰면 아무도 못 쓰는 세션이 되기 때문
  const oldToken = await getSessionToken();
  if (oldToken) await invalidateSession(oldToken);
  // ② 이 사용자의 기한 지난 세션을 지운다 (다른 기기, 시크릿 창 등에 버려진 것)
  await deleteExpiredSessions(user.id);

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  return Response.redirect(getWebUrl(), 302);
});
