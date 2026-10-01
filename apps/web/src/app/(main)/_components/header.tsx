import Link from "next/link";

import { Logo } from "./logo";

export function Header() {
  return (
    // sticky top-0: 스크롤해도 화면 맨 위에 붙어 있다. z-10: 카드가 위로 지나갈 때 헤더가 위에 보이게
    // bg-white/90 + backdrop-blur: 살짝 비치는 흰 배경. 아래로 지나가는 카드가 흐리게 비친다
    <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 backdrop-blur">
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
