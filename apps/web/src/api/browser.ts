// 브라우저에서 백엔드를 호출하는 함수 (저장 버튼처럼 사용자가 무언가를 할 때).
// 클라이언트 컴포넌트에서 React Query(useMutation 등)와 함께 쓴다.
//
// 서버용(server.ts, notes.ts, series.ts)과 나눈 이유:
// - 서버용은 server-only라서 클라이언트 컴포넌트에서 import할 수 없다
// - 브라우저는 NEXT_PUBLIC_으로 시작하는 환경 변수만 읽을 수 있다
import type { NoteSort } from "@/lib/note-list-params";

import { throwIfNotOk } from "./errors";
import { type NotesPageResponse, toNotesPage } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// JSON 본문을 담아 요청을 보내고, 응답 JSON을 돌려준다. 실패(4xx, 5xx)하면 ApiError를 던진다.
async function apiSend<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
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
    // 다른 출처(3000 → 4000)로 보내는 요청에도 쿠키를 붙인다. 기본값(same-origin)이면 쿠키가 빠져서 401이 난다.
    // 백엔드도 Access-Control-Allow-Credentials: true로 허락해야 브라우저가 응답을 넘겨준다 (apps/api/src/proxy.ts)
    credentials: "include",
    // 본문이 있을 때만 JSON으로 보낸다 (DELETE는 본문이 없다)
    ...(body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });

  await throwIfNotOk(response);

  // 204 No Content는 본문이 없어서 JSON으로 읽으면 에러가 난다
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

// seriesName: 넣을 묶음의 이름. 없는 이름이면 서버가 새로 만든다. 빈 글자면 묶음 없음.
// 순서는 서버가 정한다(맨 뒤)
type NoteInput = { title: string; content: string; seriesName: string };

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

// 이미지 올리기. 성공하면 노트 본문에 넣을 이미지 주소를 돌려준다 (예: https://api.chagoknotes.com/api/images/7)
//   ① POST /api/images 로 "이 파일 올려도 되나" 묻는다 (종류, 크기만 보냄). 백엔드가 5MB, 100MB를 확인한다
//   ② 받은 업로드 주소(S3)로 파일을 바로 보낸다. 우리 서버를 거치지 않는다 (Presigned POST)
// 이미지는 비공개라, 돌려주는 주소는 S3가 아니라 api 주소다. 볼 때마다 api가 주인을 확인한다
export async function uploadImage(file: File) {
  const { id, upload } = await apiSend<{
    id: number;
    upload: { url: string; fields: Record<string, string> };
  }>("POST", "/api/images", { contentType: file.type, size: file.size });

  // S3가 정한 형식: 받은 fields를 모두 넣고, 파일은 맨 마지막에 file이라는 이름으로
  const form = new FormData();
  for (const [name, value] of Object.entries(upload.fields)) {
    form.append(name, value);
  }
  form.append("file", file);

  // S3로 보내는 요청이라 로그인 쿠키는 필요 없다 (허락은 fields 안의 서명이 대신한다)
  const response = await fetch(upload.url, { method: "POST", body: form });
  if (!response.ok) {
    throw new Error("이미지를 올리지 못했어요. 다시 시도해 주세요.");
  }

  return `${API_URL}/api/images/${id}`;
}

// POST /api/auth/logout (로그아웃). 백엔드가 세션을 지우고 session 쿠키도 지운다. 성공하면 204
export function logout() {
  return apiSend<void>("POST", "/api/auth/logout");
}

// GET /api/notes?sort&cursor (무한스크롤의 다음 묶음)
// cursor가 null이면 첫 묶음. 응답의 nextCursor를 다음 호출의 cursor로 넘긴다
export async function getNotesPage(
  sort: NoteSort,
  q: string,
  cursor: string | null,
) {
  const params = new URLSearchParams({ sort });
  if (q) params.set("q", q);
  if (cursor) params.set("cursor", cursor);
  return toNotesPage(
    await apiSend<NotesPageResponse>("GET", `/api/notes?${params}`),
  );
}
