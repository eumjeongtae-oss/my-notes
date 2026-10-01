import Link from "next/link";

const tabs = [
  { key: "notes", label: "노트", href: "/" },
  { key: "series", label: "묶음", href: "/series" },
] as const;

// 홈의 "노트 | 묶음" 탭. 각 페이지가 지금 어느 탭인지(active) 직접 알려준다.
// usePathname(클라이언트 훅) 없이 서버 컴포넌트로 만들 수 있어서 클라이언트 경계가 생기지 않는다.
export function HomeTabs({ active }: { active: (typeof tabs)[number]["key"] }) {
  return (
    <nav
      aria-label="홈 탭"
      className="mb-8 flex gap-6 border-b border-zinc-200"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          // -mb-px: 아래 테두리(1px)와 겹치게 해서, 선택된 탭의 굵은 밑줄이 테두리 위에 놓이게 한다
          className={`-mb-px border-b-2 pb-3 text-lg font-bold ${
            tab.key === active
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
