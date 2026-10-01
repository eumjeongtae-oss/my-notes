import { FileQuestion } from "lucide-react";
import Link from "next/link";

// (main) 밖에서 나는 404 화면. 루트 layout.tsx 안쪽에 그려져서 헤더가 없다.
// 예: 라우트가 아예 없는 주소(/asdf), 없는 노트의 수정 화면(/write?id=999)
// (main) 안의 404는 (main)/not-found.tsx가 헤더와 함께 보여준다.
export default function RootNotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-24 text-center">
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
