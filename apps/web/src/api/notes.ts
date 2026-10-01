// 노트 API 호출 함수. 백엔드 apps/api/src/app/api/notes/** 와 짝이다.
import "server-only";

import { cache } from "react";

import type { NoteSort } from "@/lib/note-list-params";

import { apiGet } from "./client";
import { ApiError } from "./errors";
import {
  type Note,
  type NoteResponse,
  type NotesPage,
  type NotesPageResponse,
  toNote,
  toNotesPage,
} from "./types";

// GET /api/notes/:id
// 노트가 없거나(404) id 형식이 잘못되면(400, 예: /notes/abc) null을 돌려준다.
// 사용자 입장에서는 둘 다 "없는 페이지"라서, 화면에서 notFound()로 처리한다.
// 그 밖의 실패(500, 백엔드가 꺼져 있음 등)는 에러를 그대로 던진다.
//
// cache: 한 번의 페이지 요청 안에서 같은 id로 여러 번 불러도 API는 한 번만 호출한다.
// (읽기 페이지는 generateMetadata와 본문이 각각 getNote를 부른다)
export const getNote = cache(async (id: string): Promise<Note | null> => {
  try {
    return toNote(
      await apiGet<NoteResponse>(`/api/notes/${encodeURIComponent(id)}`),
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return null;
    }
    throw error;
  }
});

// GET /api/notes?sort=latest|oldest (첫 묶음)
// 홈의 첫 화면을 서버에서 그릴 때 쓴다. 다음 묶음부터는 브라우저가 browser.ts의 getNotesPage로 가져온다.
export async function getNotes(sort: NoteSort, q: string): Promise<NotesPage> {
  const params = new URLSearchParams({ sort });
  if (q) params.set("q", q);
  return toNotesPage(await apiGet<NotesPageResponse>(`/api/notes?${params}`));
}
