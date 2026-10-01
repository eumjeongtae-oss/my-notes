// 글쓰기 화면(/write)의 로딩 화면. 수정할 노트와 묶음 목록을 가져오는 동안 보여준다.
// 왼쪽 작성 영역, 하단 바, 오른쪽 미리보기의 자리를 note-editor.tsx와 맞춘다.
export default function WriteLoading() {
  return (
    <div role="status" className="flex h-full animate-pulse">
      <span className="sr-only">글쓰기 화면을 불러오는 중입니다</span>

      {/* 왼쪽: 작성 영역 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 px-6 pt-8 sm:px-12">
          {/* 제목, 구분선, 툴바 자리 */}
          <div className="h-10 w-2/3 rounded-lg bg-zinc-100" />
          <div className="my-6 h-1.5 w-16 rounded-full bg-zinc-100" />
          <div className="mb-4 h-9 w-3/4 rounded-md bg-zinc-100" />
          <div className="space-y-4">
            <div className="h-6 w-full rounded bg-zinc-100" />
            <div className="h-6 w-5/6 rounded bg-zinc-100" />
            <div className="h-6 w-2/3 rounded bg-zinc-100" />
          </div>
        </div>

        {/* 하단 바: 나가기, 묶음, 저장 버튼 자리 */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 shadow-[0_0_8px_rgba(0,0,0,0.1)]">
          <div className="h-11 w-28 rounded-md bg-zinc-100" />
          <div className="h-11 w-36 rounded-md bg-zinc-100" />
        </div>
      </div>

      {/* 오른쪽: 미리보기 자리. 실제 화면처럼 md 미만에서는 숨긴다 */}
      <div className="hidden min-w-0 flex-1 bg-zinc-50 md:block" />
    </div>
  );
}
