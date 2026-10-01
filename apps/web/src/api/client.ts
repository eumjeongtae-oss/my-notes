// 백엔드(apps/api)를 호출하는 공통 함수.
// 화면은 fetch를 직접 쓰지 않고 src/api/*.ts의 함수(getNote 등)만 호출한다.
//
// server-only: API_URL은 서버에만 있는 환경 변수라서, 지금 함수들은 서버 컴포넌트에서만 쓴다.
// 브라우저에서 호출하는 함수(저장 버튼 등)는 browser.ts에 있다.
import "server-only";

import { connection } from "next/server";

import { ApiError } from "./errors";

function getApiUrl() {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error(
      "API_URL이 설정되지 않았습니다. apps/web/.env를 확인하세요.",
    );
  }
  return url;
}

// GET 요청을 보내고 JSON을 돌려준다. 실패(4xx, 5xx)하면 ApiError를 던진다.
export async function apiGet<T>(path: string): Promise<T> {
  // 사용자가 요청했을 때만 API를 부른다 (빌드할 때 미리 불러서 HTML로 굳히지 않게).
  // 이게 없으면 URL 값을 안 쓰는 페이지(/series)는 빌드 때 목록이 고정되어 새 묶음이 안 보인다
  await connection();

  const response = await fetch(`${getApiUrl()}${path}`);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.message ?? `API 요청 실패 (${response.status})`,
    );
  }

  return response.json();
}
