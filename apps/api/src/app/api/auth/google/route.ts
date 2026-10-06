import { generateCodeVerifier, generateState } from "arctic";

import { setOAuthCookies } from "@/lib/auth-cookies";
import { withErrorHandling } from "@/lib/with-error-handling";
import { getGoogle, GOOGLE_SCOPES } from "@/server/auth/google";

// GET /api/auth/google
// Google 로그인 시작. 프론트의 "Google로 로그인" 버튼이 이 주소로 이동(링크)한다.
//   302: Google 로그인 화면으로 보낸다
//
// state와 codeVerifier는 보안용 무작위 값이다. 쿠키에 보관해 두고 콜백에서 확인한다.
//   state: 돌아온 요청이 "내가 시작한 로그인"인지 확인 (남이 만든 로그인 요청에 엮이는 CSRF 공격 방지)
//   codeVerifier: Google에서 받을 code를 누가 중간에 가로채도 쓸 수 없게 하는 값 (PKCE)
export const GET = withErrorHandling(async () => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = getGoogle().createAuthorizationURL(
    state,
    codeVerifier,
    GOOGLE_SCOPES,
  );

  await setOAuthCookies(state, codeVerifier);
  return Response.redirect(url, 302);
});
