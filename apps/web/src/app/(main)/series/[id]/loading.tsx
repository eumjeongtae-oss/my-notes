// 묶음 상세(/series/2)의 로딩 화면. 여백, 폭, 높이는 page.tsx와 맞춘다.
export default function SeriesLoading() {
  return (
    <div role="status" className="mx-auto max-w-3xl animate-pulse px-4 py-10">
      <span className="sr-only">묶음을 불러오는 중입니다</span>

      {/* "묶음 목록" 뒤로 가기 링크 자리 */}
      <div className="h-5 w-24 rounded bg-zinc-100" />

      {/* "묶음" 라벨, 묶음 이름, 노트 수 자리 */}
      <div className="mt-8 h-5 w-10 rounded bg-zinc-100" />
      <div className="mt-1 h-9 w-2/3 rounded-lg bg-zinc-100 sm:h-10" />
      <div className="mt-3 h-6 w-20 rounded bg-zinc-100" />

      <div className="mt-8 divide-y divide-zinc-100 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            {/* 순서 번호, 제목, 날짜 자리 */}
            <div className="size-8 shrink-0 rounded-full bg-zinc-100" />
            <div className="h-6 flex-1 rounded bg-zinc-100" />
            <div className="hidden h-5 w-28 shrink-0 rounded bg-zinc-100 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
