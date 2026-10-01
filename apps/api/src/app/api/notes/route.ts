import { withErrorHandling } from "@/lib/with-error-handling";
import { listNotes, type NoteSort } from "@/server/notes/service";

const SORTS: NoteSort[] = ["latest", "oldest"];

// GET /api/notes?sort=latest|oldest
// 노트 목록을 조회한다. 본문 대신 요약(excerpt)만 담는다.
//   200: { items: [...] }
//   400: sort 값이 latest, oldest가 아님
//
// 배열 대신 { items } 객체로 감싸는 이유:
// 무한스크롤을 붙일 때 { items, nextCursor }처럼 필드를 "추가"만 하면 되도록.
export const GET = withErrorHandling(async (request: Request) => {
  const sort = new URL(request.url).searchParams.get("sort") ?? "latest";

  // 화면은 이상한 값을 조용히 기본값으로 바꾸지만,
  // API는 호출하는 쪽이 실수를 바로 알 수 있게 400으로 알려준다.
  if (!SORTS.includes(sort as NoteSort)) {
    return Response.json(
      { message: `sort는 ${SORTS.join(", ")} 중 하나여야 합니다.` },
      { status: 400 },
    );
  }

  const items = await listNotes({ sort: sort as NoteSort });
  return Response.json({ items });
});
