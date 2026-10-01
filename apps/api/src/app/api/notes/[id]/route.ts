import { withErrorHandling } from "@/lib/with-error-handling";
import { getNoteById } from "@/server/notes/service";

// MySQL INT 칸의 최댓값. 이보다 큰 id는 존재할 수 없다.
const MAX_INT = 2_147_483_647;

// GET /api/notes/:id
// 노트 하나를 조회한다.
//   200: 노트 JSON
//   400: id가 올바른 숫자가 아님 (예: /api/notes/abc)
//   404: 해당 id의 노트가 없음
export const GET = withErrorHandling(
  async (_request: Request, ctx: RouteContext<"/api/notes/[id]">) => {
    const { id: rawId } = await ctx.params;

    // URL에서 온 값은 항상 문자열이고, 무엇이든 들어올 수 있다. 먼저 검사한다.
    // Number()부터 쓰면 "1e1"(→10), "0x13"(→19)도 숫자로 바뀌어 통과해 버린다.
    // 그래서 숫자로 바꾸기 전에 "0이 아닌 숫자로 시작하는 숫자만"인지 문자열로 확인한다.
    const id = Number(rawId);
    if (!/^[1-9]\d*$/.test(rawId) || id > MAX_INT) {
      return Response.json(
        { message: "노트 id는 1 이상의 정수여야 합니다." },
        { status: 400 },
      );
    }

    const note = await getNoteById(id);
    if (!note) {
      return Response.json(
        { message: `${id}번 노트를 찾을 수 없습니다.` },
        { status: 404 },
      );
    }

    return Response.json(note);
  },
);
