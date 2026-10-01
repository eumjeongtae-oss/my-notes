import type { NoteView } from "@/lib/note-list-params";

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

// 무한스크롤에서 다음 묶음을 불러오는 동안에도 목록 아래에 이 카드 뼈대를 보여준다
export function CardSkeleton({ view }: { view: NoteView }) {
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

// 검색창과 툴바는 홈 page.tsx에서 Suspense 밖에 그리므로, 여기서는 제목과 카드만 뼈대로 그린다.
export function NoteListSkeleton({ q, view }: { q: string; view: NoteView }) {
  const count = view === "grid" ? 6 : 4;

  return (
    <div role="status">
      <span className="sr-only">노트 목록을 불러오는 중입니다</span>

      {/* 제목은 데이터가 필요 없어서 진짜로 보여준다. 숫자(개수)만 뼈대 */}
      <h1 className="mt-8 flex items-center gap-2 text-2xl font-bold break-keep">
        {q ? `“${q}” 검색 결과` : "전체 노트"}
        <span className="inline-block h-5 w-8 animate-pulse rounded bg-zinc-100" />
      </h1>

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
