// 홈 목록을 기다리는 동안 보여줄 뼈대.
// 홈 page.tsx가 <Suspense fallback>으로 넣는다. 검색어에 맞는 제목도 함께 그린다.
//
// 여백, 폭, 높이는 note-list.tsx와 note-card.tsx에 맞춘다. 모양이 다르면 내용이 뜰 때 화면이 움직인다.

// 노트 카드 하나의 뼈대. note-card.tsx와 짝이다.
// 무한스크롤에서 다음 묶음을 불러오는 동안에도 목록 아래에 이 뼈대를 보여준다
export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
      <div className="p-6">
        <div className="h-7 w-1/2 rounded bg-zinc-100" />
        <div className="mt-4 space-y-2">
          <div className="h-5 w-full rounded bg-zinc-100" />
          <div className="h-5 w-4/5 rounded bg-zinc-100" />
        </div>
      </div>
      <div className="border-t border-zinc-100 px-6 py-3">
        <div className="h-5 w-28 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

// 검색창과 툴바는 홈 page.tsx에서 Suspense 밖에 그리므로, 여기서는 제목과 카드만 뼈대로 그린다.
export function NoteListSkeleton({ q }: { q: string }) {
  return (
    <div role="status">
      <span className="sr-only">노트 목록을 불러오는 중입니다</span>

      {/* 제목은 데이터가 필요 없어서 진짜로 보여준다. 숫자(개수)만 뼈대 */}
      <h1 className="mt-8 flex items-center gap-2 text-2xl font-bold break-keep">
        {q ? `“${q}” 검색 결과` : "전체 노트"}
        <span className="inline-block h-5 w-8 animate-pulse rounded bg-zinc-100" />
      </h1>

      <div className="mt-6 animate-pulse space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
