// 읽기 페이지의 로딩 화면 (스켈레톤).
// Next.js가 같은 폴더의 page.tsx를 <Suspense>로 감싸서, 노트를 가져오는 동안 이 화면을 보여준다.
// 헤더(layout.tsx)는 감싸지 않으므로 로딩 중에도 그대로 보인다.
//
// 실제 읽기 페이지(page.tsx)와 여백, 폭, 높이를 똑같이 맞춘다.
// 모양이 다르면 내용이 나타날 때 화면이 덜컥 움직인다(레이아웃 이동).

// 본문 줄 길이. 전부 같은 길이면 글처럼 보이지 않아서 제각각으로 둔다.
const bodyLineWidths = [
  "w-full",
  "w-11/12",
  "w-full",
  "w-4/5",
  "w-full",
  "w-2/3",
];

export default function NoteLoading() {
  return (
    // role="status": 화면을 못 보는 사용자에게 "불러오는 중"이라고 알려준다
    <div role="status" className="mx-auto max-w-3xl animate-pulse px-4 py-16">
      <span className="sr-only">노트를 불러오는 중입니다</span>

      {/* 시리즈 이름 자리 */}
      <div className="mb-4 h-5 w-32 rounded bg-zinc-100" />

      {/* 제목 자리 (두 줄) */}
      <div className="h-10 w-full rounded-lg bg-zinc-100 sm:h-12" />
      <div className="mt-3 h-10 w-2/3 rounded-lg bg-zinc-100 sm:h-12" />

      {/* 날짜, 수정 링크 자리 */}
      <div className="mt-8 flex items-center justify-between">
        <div className="h-5 w-28 rounded bg-zinc-100" />
        <div className="h-5 w-8 rounded bg-zinc-100" />
      </div>

      <hr className="mt-6 mb-12 border-zinc-100" />

      {/* 본문 자리 */}
      <div className="space-y-4">
        {bodyLineWidths.map((width, index) => (
          <div key={index} className={`h-5 rounded bg-zinc-100 ${width}`} />
        ))}
      </div>
    </div>
  );
}
