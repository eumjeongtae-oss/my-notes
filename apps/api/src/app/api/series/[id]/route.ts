import { requireUser } from "@/lib/require-user";
import { withErrorHandling } from "@/lib/with-error-handling";
import { seriesIdSchema } from "@/server/series/schema";
import { getSeriesById } from "@/server/series/service";

// GET /api/series/:id
// 내 묶음 하나와, 속한 노트들을 순서대로 조회한다.
//   200: { id, name, createdAt, notes: [{ id, title, seriesOrder, createdAt }] }
//   400: id 형식이 틀림
//   401: 로그인 안 함
//   404: 해당 id의 묶음이 없음 (남의 묶음도)
export const GET = withErrorHandling(
  async (_request: Request, ctx: RouteContext<"/api/series/[id]">) => {
    const auth = await requireUser();
    if (!auth.success) return auth.response;

    const { id: rawId } = await ctx.params;
    const parsedId = seriesIdSchema.safeParse(rawId);
    if (!parsedId.success) {
      return Response.json(
        { message: parsedId.error.issues[0].message },
        { status: 400 },
      );
    }

    const series = await getSeriesById(auth.user.id, parsedId.data);
    if (!series) {
      return Response.json(
        { message: `${parsedId.data}번 묶음을 찾을 수 없습니다.` },
        { status: 404 },
      );
    }

    return Response.json(series);
  },
);
