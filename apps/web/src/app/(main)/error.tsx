"use client"; // 에러 화면은 반드시 클라이언트 컴포넌트다 ("다시 시도" 버튼을 눌러야 하므로)

import { CloudOff, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

// (main) 안의 페이지(홈, 읽기, 묶음)에서 예상하지 못한 에러가 나면 이 화면이 본문 자리를 대신한다.
// 예: 백엔드(apps/api)가 꺼져 있거나 500 에러를 돌려줄 때.
// 같은 폴더의 layout.tsx 안쪽을 대체하므로 헤더는 그대로 보인다.
//
// "없는 노트"는 에러가 아니다. 그건 notFound()로 404 화면을 보여준다.
export default function MainError({
  error,
  retry,
}: {
  // digest: 운영 환경에서는 보안 때문에 실제 에러 내용 대신 식별 번호만 온다.
  // 서버 로그에서 이 번호로 원인을 찾는다.
  error: Error & { digest?: string };
  // retry: 데이터를 다시 가져와서 다시 그린다. 백엔드가 살아나면 정상 화면으로 돌아온다.
  retry: () => void;
}) {
  useEffect(() => {
    // 실무에서는 여기서 Sentry 같은 에러 수집 서비스로 보낸다.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <CloudOff className="size-12 text-zinc-300" strokeWidth={1.5} />
      <h1 className="mt-6 text-xl font-bold">페이지를 불러오지 못했어요</h1>
      <p className="mt-2 text-zinc-500">
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

      {/* 오류 코드는 개발할 때 서버 로그와 맞춰보는 용도라 개발 환경에서만 보여준다.
          (고객센터가 있는 서비스라면 운영에서도 보여줘서 문의할 때 쓰게 한다) */}
      {process.env.NODE_ENV === "development" && error.digest && (
        <p className="mt-8 text-xs text-zinc-400">오류 코드: {error.digest}</p>
      )}
    </div>
  );
}
