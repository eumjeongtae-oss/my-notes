// 노트 API 호출 함수. 백엔드 apps/api/src/app/api/notes/** 와 짝이다.
import "server-only";

import { cache } from "react";

import type { NoteSort } from "@/lib/note-list-params";

import { apiGet, apiGetOrNull } from "./server";
import {
  type Note,
  type NoteResponse,
  type NotesPage,
  type NotesPageResponse,
  toNote,
  toNotesPage,
} from "./types";

// GET /api/notes/:id
// 없거나 id 형식이 틀리면 null → 화면에서 notFound()로 처리한다.
//
// cache: 한 번의 페이지 요청 안에서 같은 id로 여러 번 불러도 API는 한 번만 호출한다.
// (읽기 페이지는 generateMetadata와 본문이 각각 getNote를 부른다)
export const getNote = cache(async (id: string): Promise<Note | null> => {
  const note = await apiGetOrNull<NoteResponse>(
    `/api/notes/${encodeURIComponent(id)}`,
  );
  return note && toNote(note);
});

// GET /api/notes?sort=latest|oldest (첫 묶음)
// 홈의 첫 화면을 서버에서 그릴 때 쓴다. 다음 묶음부터는 브라우저가 browser.ts의 getNotesPage로 가져온다.
export async function getNotes(sort: NoteSort, q: string): Promise<NotesPage> {
  const params = new URLSearchParams({ sort });
  if (q) params.set("q", q);
  return toNotesPage(await apiGet<NotesPageResponse>(`/api/notes?${params}`));
}
