"use client"; // 에러 화면은 반드시 클라이언트 컴포넌트다 ("다시 시도" 버튼을 눌러야 하므로)

import { CloudOff, RotateCw } from "lucide-react";
import { useEffect } from "react";

// 가장 바깥의 에러 화면. 안쪽 error.tsx가 잡지 못한 에러가 여기로 온다.
// 예: 백엔드가 꺼져 있어서 헤더 레이아웃((main)/layout.tsx)이나 로그인 페이지가 내 정보(/api/auth/me)를 못 가져올 때.
//
// error.tsx는 "같은 폴더의 layout.tsx"에서 난 에러는 잡지 않는다 (Next.js 규칙).
// 그래서 (main)/layout.tsx의 에러는 (main)/error.tsx가 아니라 한 단계 위인 이 파일이 잡는다.
// 헤더 레이아웃이 실패한 경우라 헤더 없이 보여준다.
export default function RootError({
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
      <h1 className="mt-6 text-xl font-bold">페이지를 불러오지 못했어요</h1>
      <p className="mt-2 break-keep text-zinc-500">
        서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.
      </p>

      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        <RotateCw className="size-4" />
        다시 시도
      </button>

      {process.env.NODE_ENV === "development" && error.digest && (
        <p className="mt-8 text-xs text-zinc-400">오류 코드: {error.digest}</p>
      )}
    </div>
  );
}
