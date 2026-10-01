import { withErrorHandling } from "@/lib/with-error-handling";
import { listSeries } from "@/server/series/service";

// GET /api/series
// 묶음 목록을 조회한다. 묶음은 많지 않아서 페이지네이션 없이 전부 준다.
//   200: { items: [{ id, name, noteCount, createdAt }] }
export const GET = withErrorHandling(async () => {
  return Response.json({ items: await listSeries() });
});
