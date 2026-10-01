import { getNotes } from "@/api/notes";
import type { NoteSort, NoteView } from "@/lib/note-list-params";

import { EmptyNotes } from "./empty-notes";
import { InfiniteNoteList } from "./infinite-note-list";
import { NoteListOptions } from "./note-list-options";

// 홈의 노트 목록. 첫 묶음은 서버에서 가져와 빠르게 그리고,
// 그다음 묶음부터는 InfiniteNoteList(클라이언트)가 스크롤에 맞춰 가져온다.
// API를 기다리는 부분이라 홈 page.tsx에서 <Suspense>로 감싼다.
export async function NoteList({
  view,
  sort,
}: {
  view: NoteView;
  sort: NoteSort;
}) {
  const firstPage = await getNotes(sort);

  if (firstPage.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4">
        <EmptyNotes />
      </div>
    );
  }

  // 목록형은 한 줄이 너무 길면 읽기 어려워서 폭을 좁힌다.
  return (
    <div
      className={`mx-auto px-4 py-10 ${view === "grid" ? "max-w-5xl" : "max-w-3xl"}`}
    >
      <div className="flex items-center justify-between">
        {/* 20개씩 가져와서 전체 개수는 모른다 (세려면 API가 COUNT 쿼리를 따로 해야 한다) */}
        <h1 className="text-2xl font-bold">전체 노트</h1>
        <NoteListOptions view={view} sort={sort} />
      </div>

      <InfiniteNoteList view={view} sort={sort} initialPage={firstPage} />
    </div>
  );
}
