import { SearchX } from "lucide-react";

import { getNotes } from "@/api/notes";
import type { NoteSort, NoteView } from "@/lib/note-list-params";

import { EmptyNotes } from "./empty-notes";
import { InfiniteNoteList } from "./infinite-note-list";

// 홈의 노트 목록 (제목 + 목록). 첫 묶음은 서버에서 가져와 빠르게 그리고,
// 그다음 묶음부터는 InfiniteNoteList(클라이언트)가 스크롤에 맞춰 가져온다.
// API를 기다리는 부분이라 홈 page.tsx에서 <Suspense>로 감싼다.
export async function NoteList({
  q,
  view,
  sort,
}: {
  q: string;
  view: NoteView;
  sort: NoteSort;
}) {
  const firstPage = await getNotes(sort, q);

  if (firstPage.items.length === 0) {
    // 검색 결과가 없는 것과, 노트가 아예 없는 것은 다른 화면을 보여준다
    return q ? <NoSearchResults q={q} /> : <EmptyNotes />;
  }

  return (
    <>
      {/* 전체 개수는 첫 묶음에만 온다 (백엔드가 첫 묶음에서만 COUNT를 한다) */}
      <h1 className="mt-8 text-2xl font-bold break-keep">
        {q ? `“${q}” 검색 결과` : "전체 노트"}{" "}
        <span className="text-base font-medium text-zinc-400">
          {firstPage.total}
        </span>
      </h1>

      <InfiniteNoteList q={q} view={view} sort={sort} initialPage={firstPage} />
    </>
  );
}

function NoSearchResults({ q }: { q: string }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <SearchX className="size-12 text-zinc-300" strokeWidth={1.5} />
      <p className="mt-6 text-lg font-bold break-keep">
        “{q}”에 대한 검색 결과가 없어요
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        다른 단어로 검색하거나, 검색어를 짧게 줄여 보세요.
      </p>
    </div>
  );
}
