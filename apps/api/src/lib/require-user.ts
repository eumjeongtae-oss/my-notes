// "로그인한 사람만" 쓸 수 있는 API가 맨 앞에서 부르는 공통 함수.
// parseBody처럼 성공하면 { success: true, user }, 실패하면 그대로 돌려줄 401 응답을 준다.
//
//   const auth = await requireUser();
//   if (!auth.success) return auth.response;
//   auth.user.id  ← 이 사용자의 노트만 다룬다
import { validateSessionToken } from "@/server/auth/session";

import { getSessionToken } from "./auth-cookies";

export async function requireUser() {
  const token = await getSessionToken();
  const user = token ? await validateSessionToken(token) : null;

  if (!user) {
    return {
      success: false as const,
      response: Response.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      ),
    };
  }

  return { success: true as const, user };
}
