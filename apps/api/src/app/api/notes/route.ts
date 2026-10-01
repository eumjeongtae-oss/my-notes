import { z } from "zod";

import { withErrorHandling } from "@/lib/with-error-handling";
import { createNoteSchema } from "@/server/notes/schema";
import { createNote, listNotes, type NoteSort } from "@/server/notes/service";

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

// POST /api/notes
// 새 노트를 만든다. 본문은 JSON: { "title": "...", "content": "..." }
//   201: 저장된 노트 (GET /api/notes/:id와 같은 모양)
//   400: JSON이 깨졌거나, 입력 규칙(zod)에 맞지 않음
export const POST = withErrorHandling(async (request: Request) => {
  // ① 요청 본문 읽기. JSON 문법이 틀리면 여기서 에러가 나므로 400으로 돌려준다
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 },
    );
  }

  // ② 입력 규칙으로 검사. 통과하면 result.data에는 규칙에 있는 칸만 남는다
  const result = createNoteSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        // 화면에 바로 보여줄 대표 메시지 하나
        message: result.error.issues[0].message,
        // 칸별 메시지. 화면에서 입력창 옆에 표시할 때 쓴다 → { title: ["..."] }
        fieldErrors: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  // ③ DB에 저장
  const note = await createNote(result.data);

  // ④ 201 Created: "새로 만들었다"는 뜻. Location 헤더에 새 노트의 주소를 알려준다
  return Response.json(note, {
    status: 201,
    headers: { Location: `/api/notes/${note.id}` },
  });
});
