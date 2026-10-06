// 모든 화면 요청이 페이지를 그리기 전에 먼저 거치는 곳 (Next.js 16의 Proxy, 예전 이름 middleware).
//
// 로그인 쿠키(session)가 아예 없으면 페이지를 그리지 않고 바로 /login으로 보낸다.
// 쿠키가 "있는지만" 본다. 진짜 로그인 확인(DB의 세션이 있고 기한이 남았나)은 api가 요청마다 한다 (requireUser).
//   - web은 DB를 모른다 (프로젝트 규칙)
//   - 쿠키는 있는데 만료된 경우 → 여기는 통과 → api가 401 → src/api/server.ts가 /login으로 보낸다
//
// 반대로 "로그인했는데 /login에 오면 홈으로"는 여기서 하지 않고 로그인 페이지가 api에 물어서 한다.
// 쿠키만 보고 보내면, 만료된 쿠키를 가진 사람이 /login ↔ 홈을 끝없이 오가게 된다.
import { NextResponse, type NextRequest } from "next/server";

// 백엔드가 심는 로그인 쿠키 이름 (apps/api의 SESSION_COOKIE와 같아야 한다)
const SESSION_COOKIE = "session";

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname !== "/login" &&
    !request.cookies.has(SESSION_COOKIE)
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // 화면 요청에만 실행한다. Next.js 내부 파일(_next)과 파일 주소(icon.svg처럼 점이 있는 것)는 빼야
  // 로그인 페이지의 CSS, JS, 아이콘까지 /login으로 보내지는 일이 없다
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
