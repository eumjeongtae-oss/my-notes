import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/api/auth";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "로그인" };

// 로그인이 실패하면 백엔드(콜백)가 /login?error=이유 로 돌려보낸다
const errorMessages: Record<string, string> = {
  cancelled: "로그인을 취소했어요.",
  invalid_state: "로그인 시간이 지났어요. 다시 시도해 주세요.",
  google: "Google 로그인에 실패했어요. 다시 시도해 주세요.",
};

// /login: 헤더 없는 전체 화면. (main) 그룹 밖에 있다.
// 가입과 로그인을 나누지 않는다. 처음이면 백엔드가 알아서 가입시킨다.
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // 이미 로그인했으면 홈으로. 쿠키가 아니라 api에 물어서 확인한다 (proxy.ts 설명 참고)
  if (await getCurrentUser()) redirect("/");

  const { error } = await searchParams;
  const errorMessage =
    typeof error === "string"
      ? (errorMessages[error] ?? "로그인에 실패했어요. 다시 시도해 주세요.")
      : null;

  return (
    <main className="flex min-h-full items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 text-center shadow-sm ring-1 ring-zinc-200">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-4 text-zinc-500">차곡차곡 쌓는 나만의 마크다운 노트</p>

        {/* 백엔드의 로그인 시작 주소로 "이동"한다 (fetch가 아니라 페이지 이동).
            Google 화면을 거쳐 백엔드 콜백 → 다시 홈으로 돌아온다.
            Next.js의 <Link>는 우리 사이트 안 이동용이라, 다른 서버(4000)로 가는 건 <a>를 쓴다 */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white py-3 font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
        >
          <GoogleIcon />
          Google로 계속하기
        </a>

        {errorMessage && (
          <p role="alert" className="mt-4 text-sm text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}

// Google 로그인 버튼에 쓰는 공식 "G" 로고 (Google 브랜드 가이드의 색 그대로)
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
