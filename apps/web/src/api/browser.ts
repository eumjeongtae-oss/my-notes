// 브라우저에서 백엔드를 호출하는 함수 (저장 버튼처럼 사용자가 무언가를 할 때).
// 클라이언트 컴포넌트에서 React Query(useMutation 등)와 함께 쓴다.
//
// 서버용(client.ts, notes.ts)과 나눈 이유:
// - 서버용은 server-only라서 클라이언트 컴포넌트에서 import할 수 없다
// - 브라우저는 NEXT_PUBLIC_으로 시작하는 환경 변수만 읽을 수 있다
import { ApiError } from "./errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// JSON 본문을 담아 요청을 보내고, 응답 JSON을 돌려준다. 실패(4xx, 5xx)하면 ApiError를 던진다.
async function apiSend<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL이 설정되지 않았습니다. apps/web/.env를 확인하세요.",
    );
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    // 본문이 있을 때만 JSON으로 보낸다 (DELETE는 본문이 없다)
    ...(body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      data?.message ?? `API 요청 실패 (${response.status})`,
    );
  }

  // 204 No Content는 본문이 없어서 JSON으로 읽으면 에러가 난다
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

type NoteInput = { title: string; content: string };

// 저장한 뒤 그 노트의 읽기 페이지로 이동하려고 응답에서 id만 쓴다.

// POST /api/notes (새 노트)
export function createNote(input: NoteInput) {
  return apiSend<{ id: number }>("POST", "/api/notes", input);
}

// PATCH /api/notes/:id (기존 노트 수정)
export function updateNote(id: number, input: Partial<NoteInput>) {
  return apiSend<{ id: number }>("PATCH", `/api/notes/${id}`, input);
}

// DELETE /api/notes/:id (노트 삭제). 성공하면 204라 돌려줄 값이 없다
export function deleteNote(id: number) {
  return apiSend<void>("DELETE", `/api/notes/${id}`);
}
