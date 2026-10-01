import { parseBody } from "@/lib/parse-body";
import { withErrorHandling } from "@/lib/with-error-handling";
import { createNoteSchema, listNotesQuerySchema } from "@/server/notes/schema";
import { createNote, listNotes } from "@/server/notes/service";

// GET /api/notes?q=검색어&sort=latest|oldest&limit=20&cursor=...
// 노트 목록을 한 묶음씩 조회한다 (커서 페이지네이션). 본문 대신 요약(excerpt)만 담는다.
//   200: { items: [...], nextCursor: "..." | null, total?: number }
//        total(전체 개수)은 첫 묶음(cursor 없음)에만 있다
//        다음 묶음은 nextCursor를 cursor에 그대로 넣어 요청한다. null이면 마지막 묶음
//   400: sort, limit, cursor가 규칙에 맞지 않음
//
// 처음에 배열 대신 { items }로 감싸둔 덕분에, 기존 응답에 nextCursor를 "추가"만 했다.
export const GET = withErrorHandling(async (request: Request) => {
  // URL 쿼리를 객체로 바꿔서 zod 규칙으로 검사한다 (?limit=20 → { limit: "20" } → 숫자 20)
  // 화면은 이상한 값을 조용히 기본값으로 바꾸지만,
  // API는 호출하는 쪽이 실수를 바로 알 수 있게 400으로 알려준다.
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listNotesQuerySchema.safeParse(query);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  return Response.json(await listNotes(parsed.data));
});

// POST /api/notes
// 새 노트를 만든다. 본문은 JSON: { "title": "...", "content": "...", "seriesName": "..." }
// seriesName은 생략 가능. 그 이름의 묶음이 없으면 새로 만들어서 넣는다
//   201: 저장된 노트 (GET /api/notes/:id와 같은 모양)
//   400: JSON이 깨졌거나, 입력 규칙(zod)에 맞지 않음
export const POST = withErrorHandling(async (request: Request) => {
  // ① 본문(JSON)을 읽고 ② 입력 규칙으로 검사. 실패하면 400 응답을 그대로 돌려준다
  const parsed = await parseBody(request, createNoteSchema);
  if (!parsed.success) return parsed.response;

  // ③ DB에 저장. seriesName의 묶음이 없으면 같이 만든다
  const note = await createNote(parsed.data);

  // ④ 201 Created: "새로 만들었다"는 뜻. Location 헤더에 새 노트의 주소를 알려준다
  return Response.json(note, {
    status: 201,
    headers: { Location: `/api/notes/${note.id}` },
  });
});
