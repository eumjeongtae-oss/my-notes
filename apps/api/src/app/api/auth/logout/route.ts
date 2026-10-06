import { deleteSessionCookie, getSessionToken } from "@/lib/auth-cookies";
import { withErrorHandling } from "@/lib/with-error-handling";
import { invalidateSession } from "@/server/auth/session";

// POST /api/auth/logout
// 로그아웃. DB의 세션을 지우고 브라우저의 쿠키도 지운다.
//   204: 로그아웃함. 이미 로그아웃된 상태여도 204 (결과가 같으니 에러로 보지 않는다)
//
// 지금 이 브라우저만 로그아웃된다. 다른 기기(휴대폰 등)의 세션은 그대로다.
//
// GET이 아니라 POST인 이유: GET은 "조회"라서 링크, 이미지 주소, 미리 불러오기(prefetch)로도 불린다.
// 로그아웃처럼 상태를 바꾸는 요청을 GET으로 만들면 <img src="/api/auth/logout"> 하나로 로그아웃시킬 수 있다
export const POST = withErrorHandling(async () => {
  const token = await getSessionToken();
  if (token) await invalidateSession(token);
  await deleteSessionCookie();

  return new Response(null, { status: 204 });
});
