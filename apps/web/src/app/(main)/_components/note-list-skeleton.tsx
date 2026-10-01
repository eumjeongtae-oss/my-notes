import type { NoteSort, NoteView } from "@/lib/note-list-params";

import { NoteListOptions } from "./note-list-options";

// 홈 목록을 기다리는 동안 보여줄 뼈대.
// loading.tsx는 URL(?view=grid)을 읽을 수 없어서, 홈 page.tsx가 <Suspense fallback>으로 직접 넣는다.
// 그래서 지금 보기 방식(목록형, 카드형)에 맞는 모양을 그릴 수 있다.
//
// 여백, 폭, 높이는 note-list.tsx와 note-card.tsx에 맞춘다. 모양이 다르면 내용이 뜰 때 화면이 움직인다.

// 카드 안쪽 모양. note-card.tsx의 styles와 짝이다.
const cardStyles = {
  grid: {
    body: "p-5",
    title: "h-7 w-3/4",
    excerpt: ["h-4 w-full", "h-4 w-full", "h-4 w-2/3"],
    excerptGap: "mt-3 space-y-2",
    footer: "px-5 py-3",
    date: "h-4 w-24",
  },
  list: {
    body: "p-6",
    title: "h-7 w-1/2",
    excerpt: ["h-5 w-full", "h-5 w-4/5"],
    excerptGap: "mt-4 space-y-2",
    footer: "px-6 py-3",
    date: "h-5 w-28",
  },
} satisfies Record<NoteView, Record<string, string | string[]>>;

function CardSkeleton({ view }: { view: NoteView }) {
  const style = cardStyles[view];
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
      <div className={style.body}>
        <div className={`rounded bg-zinc-100 ${style.title}`} />
        <div className={style.excerptGap}>
          {style.excerpt.map((size, index) => (
            <div key={index} className={`rounded bg-zinc-100 ${size}`} />
          ))}
        </div>
      </div>
      <div className={`border-t border-zinc-100 ${style.footer}`}>
        <div className={`rounded bg-zinc-100 ${style.date}`} />
      </div>
    </div>
  );
}

export function NoteListSkeleton({
  view,
  sort,
}: {
  view: NoteView;
  sort: NoteSort;
}) {
  const count = view === "grid" ? 6 : 4;

  return (
    <div
      role="status"
      className={`mx-auto px-4 py-10 ${view === "grid" ? "max-w-5xl" : "max-w-3xl"}`}
    >
      <span className="sr-only">노트 목록을 불러오는 중입니다</span>

      {/* 제목과 툴바는 데이터가 필요 없어서 진짜로 보여준다. 숫자(노트 개수)만 뼈대 */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          전체 노트
          <span className="inline-block h-5 w-6 animate-pulse rounded bg-zinc-100" />
        </h1>
        <NoteListOptions view={view} sort={sort} />
      </div>

      <div
        className={`mt-6 animate-pulse ${
          view === "grid"
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }`}
      >
        {Array.from({ length: count }, (_, index) => (
          <CardSkeleton key={index} view={view} />
        ))}
      </div>
    </div>
  );
}
