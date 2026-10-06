// 로그인 API 호출 함수. 백엔드 apps/api/src/app/api/auth/** 와 짝이다.
import "server-only";

import { cache } from "react";

import { throwIfNotOk } from "./errors";
import { fetchWithSession } from "./server";

export type CurrentUser = {
  id: number;
  email: string;
  name: string;
  picture: string | null;
  canUploadImages: boolean;
};

// GET /api/auth/me
// 지금 로그인한 사용자. 로그인 안 했으면(401) null.
// apiGet과 달리 401이어도 /login으로 보내지 않는다. 로그인 페이지에서 "이미 로그인했나?"를 물을 때 쓰는데,
// 거기서 /login으로 보내면 자기 자신으로 계속 이동하게 된다.
//
// cache: 한 번 그릴 때 헤더와 페이지가 둘 다 불러도 API는 한 번만 호출한다
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const response = await fetchWithSession("/api/auth/me");
  if (response.status === 401) return null;
  await throwIfNotOk(response);
  return response.json();
});
