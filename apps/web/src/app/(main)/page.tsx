import { Suspense } from "react";

import { parseSort, parseView } from "@/lib/note-list-params";

import { NoteList } from "./_components/note-list";
import { NoteListSkeleton } from "./_components/note-list-skeleton";

// 홈. URL에서 보기 방식과 정렬만 읽고(바로 끝남), API를 기다리는 목록은 <Suspense>로 감싼다.
// 기다리는 동안 지금 보기 방식에 맞는 뼈대(NoteListSkeleton)가 보인다.
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const view = parseView(params.view);
  const sort = parseSort(params.sort);

  return (
    // key: 정렬이나 보기 방식을 바꾸면 새 목록을 기다리는 동안 다시 뼈대를 보여준다.
    // (key가 같으면 React가 이전 목록을 그대로 둔 채 기다린다)
    <Suspense
      key={`${view}-${sort}`}
      fallback={<NoteListSkeleton view={view} sort={sort} />}
    >
      <NoteList view={view} sort={sort} />
    </Suspense>
  );
}
