// 서버 컴포넌트에서 백엔드(apps/api)를 호출하는 공통 함수. 브라우저용 browser.ts와 짝이다.
// 화면은 fetch를 직접 쓰지 않고 src/api/*.ts의 함수(getNote 등)만 호출한다.
//
// server-only: API_URL은 서버에만 있는 환경 변수라서, 지금 함수들은 서버 컴포넌트에서만 쓴다.
// 브라우저에서 호출하는 함수(저장 버튼 등)는 browser.ts에 있다.
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, throwIfNotOk } from "./errors";

function getApiUrl() {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error(
      "API_URL이 설정되지 않았습니다. apps/web/.env를 확인하세요.",
    );
  }
  return url;
}

// 백엔드가 로그인 확인에 쓰는 쿠키 이름 (apps/api의 SESSION_COOKIE와 같아야 한다)
const SESSION_COOKIE = "session";

// GET 요청을 보내고 JSON을 돌려준다.
//   401(로그인 안 함, 세션 만료) → 로그인 페이지로 보낸다
//   그 밖의 실패(4xx, 5xx) → ApiError를 던진다
//
// 쿠키 전달: 브라우저 → web 서버 요청에 실려 온 session 쿠키를, web 서버 → api 요청에 그대로 붙인다.
// 서버끼리의 fetch는 브라우저가 아니라서 쿠키를 자동으로 붙여 주지 않는다. 안 붙이면 api는 "로그인 안 한 사람"으로 본다.
// session 쿠키만 골라서 보낸다 (다른 쿠키까지 백엔드에 넘길 이유가 없다).
//
// cookies()는 요청마다 값이 달라서, 이걸 쓰는 페이지는 빌드 때 HTML로 굳지 않고 요청 때마다 그려진다
export async function apiGet<T>(path: string): Promise<T> {
  const session = (await cookies()).get(SESSION_COOKIE);

  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: session ? { Cookie: `${SESSION_COOKIE}=${session.value}` } : {},
  });
  if (response.status === 401) redirect("/login");
  await throwIfNotOk(response);
  return response.json();
}

// apiGet과 같지만, 없거나(404) id 형식이 잘못되면(400, 예: /notes/abc) null을 돌려준다.
// 사용자 입장에서는 둘 다 "없는 페이지"라서, 화면에서 notFound()로 처리한다.
// 그 밖의 실패(500, 백엔드가 꺼져 있음 등)는 에러를 그대로 던진다 → error.tsx
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return null;
    }
    throw error;
  }
}
