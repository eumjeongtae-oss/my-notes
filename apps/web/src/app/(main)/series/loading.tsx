import { HomeTabs } from "../_components/home-tabs";

// 묶음 목록(/series)의 로딩 화면. 여백, 폭, 높이는 page.tsx와 맞춘다.
// 탭은 데이터가 필요 없어서 진짜로 그린다 (노트 탭에서 넘어올 때 탭이 깜빡이지 않게)
export default function SeriesListLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <HomeTabs active="series" />

      <div role="status" className="animate-pulse">
        <span className="sr-only">묶음 목록을 불러오는 중입니다</span>

        {/* "전체 묶음 N" 제목 자리 */}
        <div className="h-8 w-36 rounded bg-zinc-100" />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200"
            >
              {/* 아이콘, 묶음 이름, 노트 수와 날짜 자리 */}
              <div className="size-5 rounded bg-zinc-100" />
              <div className="mt-3 h-7 w-2/3 rounded bg-zinc-100" />
              <div className="mt-4 h-5 w-40 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
