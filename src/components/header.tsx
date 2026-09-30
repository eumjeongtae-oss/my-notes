import { NotebookPen } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-100 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <NotebookPen className="size-4" />
          </span>
          <span className="text-xl font-bold tracking-tight">my-notes</span>
        </Link>

        <Link
          href="/write"
          className="rounded-full border border-zinc-900 px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-zinc-900 hover:text-white"
        >
          새 노트
        </Link>
      </div>
    </header>
  );
}
