import { FileQuestion } from "lucide-react";
import Link from "next/link";

// (main) 안의 페이지가 notFound()를 부르면 이 화면이 본문 자리에 나온다.
// 예: 없는 노트(/notes/999), id 형식이 틀린 주소(/notes/abc), 없는 묶음(/series/999)
// error.tsx처럼 layout.tsx 안쪽에 그려지므로 헤더는 그대로 보인다.
export default function MainNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <FileQuestion className="size-12 text-zinc-300" strokeWidth={1.5} />
      <h1 className="mt-6 text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 break-keep text-zinc-500">
        삭제되었거나 주소가 잘못되었을 수 있어요.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        홈으로
      </Link>
    </div>
  );
}
