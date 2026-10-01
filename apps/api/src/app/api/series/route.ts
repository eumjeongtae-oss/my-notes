import { parseBody } from "@/lib/parse-body";
import { withErrorHandling } from "@/lib/with-error-handling";
import { createSeriesSchema } from "@/server/series/schema";
import { createSeries, listSeries } from "@/server/series/service";

// GET /api/series
// 묶음 목록을 조회한다. 묶음은 많지 않아서 페이지네이션 없이 전부 준다.
//   200: { items: [{ id, name, noteCount, createdAt }] }
export const GET = withErrorHandling(async () => {
  return Response.json({ items: await listSeries() });
});

// POST /api/series
// 새 묶음을 만든다. 본문은 JSON: { "name": "..." }
//   201: 만든 묶음 { id, name, noteCount: 0, createdAt }
//   400: 이름이 비었거나 너무 김
//   409: 같은 이름의 묶음이 이미 있음 (요청은 맞지만 지금 데이터와 충돌)
export const POST = withErrorHandling(async (request: Request) => {
  const parsed = await parseBody(request, createSeriesSchema);
  if (!parsed.success) return parsed.response;

  const series = await createSeries(parsed.data);
  if (!series) {
    return Response.json(
      { message: `"${parsed.data.name}" 묶음이 이미 있습니다.` },
      { status: 409 },
    );
  }

  return Response.json(series, {
    status: 201,
    headers: { Location: `/api/series/${series.id}` },
  });
});
