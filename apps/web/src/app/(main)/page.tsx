import { Suspense } from "react";

import { parseQuery, parseSort, parseView } from "@/lib/note-list-params";

import { HomeTabs } from "./_components/home-tabs";
import { NoteList } from "./_components/note-list";
import { NoteListOptions } from "./_components/note-list-options";
import { NoteListSkeleton } from "./_components/note-list-skeleton";
import { NoteSearch } from "./_components/note-search";

// 홈. URL에서 검색어, 보기 방식, 정렬만 읽고(바로 끝남), API를 기다리는 목록은 <Suspense>로 감싼다.
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const q = parseQuery(params.q);
  const view = parseView(params.view);
  const sort = parseSort(params.sort);

  // 목록형은 한 줄이 너무 길면 읽기 어려워서 폭을 좁힌다.
  return (
    <div
      className={`mx-auto px-4 py-10 ${view === "grid" ? "max-w-5xl" : "max-w-3xl"}`}
    >
      <HomeTabs active="notes" />

      {/* 검색창과 툴바는 Suspense "밖"에 둔다.
          안에 두면 검색어가 바뀔 때마다(key 변경) 검색창까지 새로 만들어져서 입력 중에 포커스가 사라진다 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <NoteSearch q={q} view={view} sort={sort} />
        <NoteListOptions q={q} view={view} sort={sort} />
      </div>

      {/* key: 검색어, 정렬, 보기 방식이 바뀌면 새 목록을 기다리는 동안 다시 뼈대를 보여준다.
          (key가 같으면 React가 이전 목록을 그대로 둔 채 기다린다) */}
      <Suspense
        key={`${q}-${view}-${sort}`}
        fallback={<NoteListSkeleton q={q} view={view} />}
      >
        <NoteList q={q} view={view} sort={sort} />
      </Suspense>
    </div>
  );
}
