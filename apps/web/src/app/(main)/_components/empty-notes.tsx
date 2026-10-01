import Image from "next/image";
import Link from "next/link";

export function EmptyNotes() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <Image src="/empty-notes.svg" alt="" width={240} height={180} priority />
      <h2 className="mt-8 text-xl font-bold">아직 작성한 노트가 없어요</h2>
      <p className="mt-2 text-zinc-500">
        공부한 내용이나 떠오른 생각을 첫 노트로 남겨 보세요.
      </p>
      <Link
        href="/write"
        className="mt-8 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        첫 노트 쓰기
      </Link>
    </div>
  );
}
