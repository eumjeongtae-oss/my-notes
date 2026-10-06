// 모든 /api 요청이 route.ts에 도착하기 전에 먼저 거치는 곳. (Next.js 16의 Proxy, 예전 이름은 middleware)
// 여기서 CORS 허가 헤더를 붙인다.
//
// CORS: 브라우저는 다른 출처(포트가 다르면 다른 출처)의 API 응답을 기본적으로 막는다.
// 백엔드가 "이 출처는 허락한다"는 헤더를 붙여줘야 브라우저가 통과시킨다.
// Postman, REST Client, 서버끼리의 요청은 CORS 검사를 하지 않는다. 브라우저만 한다.
import { NextResponse, type NextRequest } from "next/server";

// 허락할 출처(프론트 주소). 배포하면 실제 주소로 바꾼다 → apps/api/.env의 CORS_ORIGINS
const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  // 사전 확인 결과를 브라우저가 10분 동안 기억한다 (매번 OPTIONS를 보내지 않게)
  "Access-Control-Max-Age": "600",
  // 쿠키(로그인 세션)가 붙은 요청을 허락한다. 프론트 fetch의 credentials: "include"와 짝이다.
  // 이게 있으면 Allow-Origin에 "*"를 쓸 수 없고, 위처럼 허락한 출처를 정확히 적어야 한다
  "Access-Control-Allow-Credentials": "true",
};

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // 허락한 출처만 Allow-Origin을 붙인다. 다른 출처는 헤더가 없으니 브라우저가 막는다.
  // Vary: Origin → 출처마다 응답(헤더)이 다르다는 표시. 중간 캐시가 다른 출처의 응답을 재사용하지 않게 한다
  const originHeaders: Record<string, string> = isAllowedOrigin
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : { Vary: "Origin" };

  // ① 사전 확인 요청(preflight). 브라우저가 "이 출처에서 POST로 JSON 보내도 돼요?"라고 묻는 OPTIONS 요청.
  //    route.ts까지 보내지 않고 여기서 바로 "된다/안 된다"를 답한다 (204: 본문 없는 성공)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: { ...originHeaders, ...corsHeaders },
    });
  }

  // ② 실제 요청. route.ts가 응답을 만들고, 그 응답에 허가 헤더를 덧붙인다
  const response = NextResponse.next();
  for (const [key, value] of Object.entries({
    ...originHeaders,
    ...corsHeaders,
  })) {
    response.headers.set(key, value);
  }
  return response;
}

// /api로 시작하는 요청에만 적용한다
export const config = {
  matcher: "/api/:path*",
};
