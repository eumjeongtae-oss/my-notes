import { requireUser } from "@/lib/require-user";
import { withErrorHandling } from "@/lib/with-error-handling";

// GET /api/auth/me
// 지금 로그인한 사용자. 프론트가 헤더에 이름과 사진을 보여주거나, 로그인 여부를 확인할 때 쓴다.
//   200: { id, email, name, picture, canUploadImages }
//   401: 로그인 안 함 (쿠키가 없거나, 없는 세션이거나, 기한이 지남)
export const GET = withErrorHandling(async () => {
  const auth = await requireUser();
  if (!auth.success) return auth.response;

  return Response.json(auth.user);
});
