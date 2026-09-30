// 백엔드(apps/api)를 호출하는 공통 함수.
// 화면은 fetch를 직접 쓰지 않고 src/api/*.ts의 함수(getNote 등)만 호출한다.
//
// server-only: API_URL은 서버에만 있는 환경 변수라서, 지금 함수들은 서버 컴포넌트에서만 쓴다.
// 브라우저에서 호출하는 함수(저장 버튼 등)는 React Query를 도입할 때 따로 만든다.
import "server-only";

// 백엔드가 에러일 때 돌려주는 형식: { message: "..." }
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

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
