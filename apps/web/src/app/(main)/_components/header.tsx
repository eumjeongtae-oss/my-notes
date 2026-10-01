import Link from "next/link";

import { Logo } from "./logo";

export function Header() {
  return (
    <header className="border-b border-zinc-100 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" aria-label="차곡 홈">
          <Logo />
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
