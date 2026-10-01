"use client"; // 에러 화면은 반드시 클라이언트 컴포넌트다 ("다시 시도" 버튼을 눌러야 하므로)

import { CloudOff, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

// 글쓰기 화면(/write)에서 예상하지 못한 에러가 나면 이 화면을 보여준다.
// 예: 백엔드가 꺼져 있어서 수정할 노트나 묶음 목록을 가져오지 못할 때.
// /write는 (main) 밖이라 (main)/error.tsx가 닿지 않아서 따로 둔다.
export default function WriteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <CloudOff className="size-12 text-zinc-300" strokeWidth={1.5} />
      <h1 className="mt-6 text-xl font-bold">글쓰기 화면을 열지 못했어요</h1>
      <p className="mt-2 break-keep text-zinc-500">
        서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          <RotateCw className="size-4" />
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-zinc-100"
        >
          홈으로
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && error.digest && (
        <p className="mt-8 text-xs text-zinc-400">오류 코드: {error.digest}</p>
      )}
    </div>
  );
}
