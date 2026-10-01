import { withErrorHandling } from "@/lib/with-error-handling";
import { listSeries } from "@/server/series/service";

// GET /api/series
// 묶음 목록을 조회한다. 묶음은 많지 않아서 페이지네이션 없이 전부 준다.
//   200: { items: [{ id, name, noteCount, createdAt }] }
//
// 묶음을 만들고 지우는 API는 따로 없다 (velog 방식).
// 노트를 저장할 때 seriesName을 보내면 자동으로 생기고, 마지막 노트가 빠지면 자동으로 사라진다.
export const GET = withErrorHandling(async () => {
  return Response.json({ items: await listSeries() });
});
