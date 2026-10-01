import { parseBody } from "@/lib/parse-body";
import { withErrorHandling } from "@/lib/with-error-handling";
import { noteIdSchema, updateNoteSchema } from "@/server/notes/schema";
import { deleteNote, getNoteById, updateNote } from "@/server/notes/service";

type Context = RouteContext<"/api/notes/[id]">;

// URL의 id를 검사해서 숫자로 바꾼다. 형식이 틀리면 400 응답을 돌려준다.
// GET, PATCH, DELETE가 같이 쓴다.
async function parseNoteId(
  ctx: Context,
): Promise<
  { success: true; id: number } | { success: false; response: Response }
> {
  const { id } = await ctx.params;
  const result = noteIdSchema.safeParse(id);
  if (!result.success) {
    return {
      success: false,
      response: Response.json(
        { message: result.error.issues[0].message },
        { status: 400 },
      ),
    };
  }
  return { success: true, id: result.data };
}

function notFound(id: number) {
  return Response.json(
    { message: `${id}번 노트를 찾을 수 없습니다.` },
    { status: 404 },
  );
}

// GET /api/notes/:id
// 노트 하나를 조회한다.
//   200: 노트 JSON
//   400: id가 올바른 숫자가 아님 (예: /api/notes/abc)
//   404: 해당 id의 노트가 없음
export const GET = withErrorHandling(
  async (_request: Request, ctx: Context) => {
    const parsedId = await parseNoteId(ctx);
    if (!parsedId.success) return parsedId.response;

    const note = await getNoteById(parsedId.id);
    if (!note) return notFound(parsedId.id);

    return Response.json(note);
  },
);

// PATCH /api/notes/:id
// 노트를 고친다. 바꿀 칸만 보내면 된다: { "title": "..." } 또는 { "title": "...", "content": "..." }
//   200: 고친 노트 (GET과 같은 모양)
//   400: id 형식이 틀림, JSON이 깨짐, 입력 규칙에 맞지 않음, 아무 칸도 안 보냄
//   404: 해당 id의 노트가 없음
export const PATCH = withErrorHandling(
  async (request: Request, ctx: Context) => {
    const parsedId = await parseNoteId(ctx);
    if (!parsedId.success) return parsedId.response;

    const parsedBody = await parseBody(request, updateNoteSchema);
    if (!parsedBody.success) return parsedBody.response;

    const note = await updateNote(parsedId.id, parsedBody.data);
    if (!note) return notFound(parsedId.id);

    return Response.json(note);
  },
);

// DELETE /api/notes/:id
// 노트를 지운다.
//   204: 지움 (돌려줄 내용이 없어서 본문 없음)
//   400: id 형식이 틀림
//   404: 해당 id의 노트가 없음
export const DELETE = withErrorHandling(
  async (_request: Request, ctx: Context) => {
    const parsedId = await parseNoteId(ctx);
    if (!parsedId.success) return parsedId.response;

    const deleted = await deleteNote(parsedId.id);
    if (!deleted) return notFound(parsedId.id);

    return new Response(null, { status: 204 });
  },
);
