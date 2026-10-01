import { Suspense } from "react";

import { parseQuery, parseSort } from "@/lib/note-list-params";

import { HomeTabs } from "./_components/home-tabs";
import { NoteList } from "./_components/note-list";
import { NoteListOptions } from "./_components/note-list-options";
import { NoteListSkeleton } from "./_components/note-list-skeleton";
import { NoteSearch } from "./_components/note-search";

// 홈. URL에서 검색어, 정렬만 읽고(바로 끝남), API를 기다리는 목록은 <Suspense>로 감싼다.
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const q = parseQuery(params.q);
  const sort = parseSort(params.sort);

  // 한 줄이 너무 길면 읽기 어려워서 폭을 좁힌다 (묶음 페이지와 같은 폭)
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <HomeTabs active="notes" />

      {/* 검색창과 툴바는 Suspense "밖"에 둔다.
          안에 두면 검색어가 바뀔 때마다(key 변경) 검색창까지 새로 만들어져서 입력 중에 포커스가 사라진다 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <NoteSearch q={q} sort={sort} />
        <NoteListOptions q={q} sort={sort} />
      </div>

      {/* key: 검색어나 정렬이 바뀌면 새 목록을 기다리는 동안 다시 뼈대를 보여준다.
          (key가 같으면 React가 이전 목록을 그대로 둔 채 기다린다) */}
      <Suspense key={`${q}-${sort}`} fallback={<NoteListSkeleton q={q} />}>
        <NoteList q={q} sort={sort} />
      </Suspense>
    </div>
  );
}
