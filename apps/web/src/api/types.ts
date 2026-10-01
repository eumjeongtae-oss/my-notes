// 백엔드 응답의 모양(타입)과, 화면에서 쓰기 좋게 바꾸는 함수.
// 서버용(notes.ts)과 브라우저용(browser.ts)이 같이 쓴다. 그래서 server-only를 붙이지 않는다.
//
// JSON에는 날짜 타입이 없어서 날짜는 문자열로 온다. 화면에서는 Date로 바꿔서 formatDate에 바로 넘긴다.

type Series = { id: number; name: string };

// ── 노트 하나 (GET /api/notes/:id) ─────────────────────────────

export type NoteResponse = {
  id: number;
  title: string;
  content: string;
  seriesOrder: number | null;
  createdAt: string;
  updatedAt: string;
  series: Series | null;
};

export type Note = Omit<NoteResponse, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

export function toNote(response: NoteResponse): Note {
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  };
}

// ── 노트 목록 (GET /api/notes) ─────────────────────────────────

// 목록의 노트 하나. 본문(content) 대신 요약(excerpt)만 온다.
export type NoteSummaryResponse = {
  id: number;
  title: string;
  excerpt: string;
  createdAt: string;
  series: Series | null;
};

export type NoteSummary = Omit<NoteSummaryResponse, "createdAt"> & {
  createdAt: Date;
};

// 목록 한 묶음. nextCursor를 다음 요청의 cursor로 넣으면 이어서 가져온다. null이면 마지막 묶음
// total(전체 개수)은 첫 묶음에만 온다
export type NotesPageResponse = {
  items: NoteSummaryResponse[];
  nextCursor: string | null;
  total?: number;
};

export type NotesPage = {
  items: NoteSummary[];
  nextCursor: string | null;
  total?: number;
};

export function toNotesPage(response: NotesPageResponse): NotesPage {
  return {
    items: response.items.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    })),
    nextCursor: response.nextCursor,
    total: response.total,
  };
}
