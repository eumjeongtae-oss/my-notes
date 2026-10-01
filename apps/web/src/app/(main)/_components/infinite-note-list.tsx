"use client";

// 홈의 무한스크롤 목록.
// 첫 묶음(initialPage)은 서버가 가져와서 넘겨주고, 그다음 묶음부터는 브라우저가 가져온다.
//
// 흐름: 목록 맨 아래에 보이지 않는 "감지용 칸"을 두고, 그 칸이 화면 근처(600px 전)에 오면
//      fetchNextPage()로 다음 묶음을 가져와 목록 뒤에 이어 붙인다.
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { getNotesPage } from "@/api/browser";
import { noteKeys } from "@/api/query-keys";
import type { NotesPage } from "@/api/types";
import type { NoteSort } from "@/lib/note-list-params";

import { NoteCard } from "./note-card";
import { CardSkeleton } from "./note-list-skeleton";

// 감지용 칸이 화면 아래 600px 안쪽에 들어오면 미리 불러오기 시작한다 (카드 3~4개쯤 남았을 때).
// 끝에 닿은 뒤에 불러오면 사용자가 잠깐 멈춰서 기다리게 된다.
const PREFETCH_MARGIN = "0px 0px 600px 0px";

export function InfiniteNoteList({
  q,
  sort,
  initialPage,
}: {
  q: string;
  sort: NoteSort;
  initialPage: NotesPage;
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    // 정렬, 검색어마다 따로 보관한다 (최신순 목록과 "docker" 검색 결과는 다른 데이터)
    queryKey: noteKeys.list(sort, q),
    // pageParam: 이번에 가져올 묶음의 커서. 첫 묶음은 null
    queryFn: ({ pageParam }) => getNotesPage(sort, q, pageParam),
    initialPageParam: null as string | null,
    // 다음 묶음의 커서. undefined나 null이면 hasNextPage가 false가 된다
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // 첫 묶음은 서버가 이미 가져왔으니 그대로 쓴다 (브라우저가 다시 요청하지 않는다)
    initialData: { pages: [initialPage], pageParams: [null] },
  });

  // 묶음들([[20개], [20개], ...])을 한 줄로 펼친다
  const notes = data.pages.flatMap((page) => page.items);

  // 감지용 칸이 화면 근처에 오면 다음 묶음을 가져온다
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: PREFETCH_MARGIN },
    );
    observer.observe(sentinel);
    // 화면에서 사라지거나 값이 바뀌면 감시를 멈춘다 (안 하면 감시가 계속 쌓인다)
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div className="mt-6 space-y-4">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}

        {/* 다음 묶음을 불러오는 동안 목록 아래에 카드 뼈대를 보여준다 */}
        {isFetchingNextPage &&
          Array.from({ length: 2 }, (_, index) => (
            <div key={index} role="status" className="animate-pulse">
              <span className="sr-only">노트를 더 불러오는 중입니다</span>
              <CardSkeleton />
            </div>
          ))}
      </div>

      {/* 보이지 않는 감지용 칸 */}
      <div ref={sentinelRef} aria-hidden />

      {isFetchNextPageError && (
        <div className="mt-8 text-center text-sm text-zinc-500">
          노트를 더 불러오지 못했어요.{" "}
          <button
            type="button"
            onClick={() => fetchNextPage()}
            className="font-semibold text-zinc-900 underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {!hasNextPage && (
        <p className="mt-12 text-center text-sm text-zinc-400">
          모든 노트를 봤어요
        </p>
      )}
    </>
  );
}
