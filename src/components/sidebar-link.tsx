"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 현재 URL을 알아야 선택된 노트를 강조할 수 있는데, usePathname은 클라이언트 훅이다.
// 그래서 사이드바 전체가 아니라 링크 하나만 클라이언트 컴포넌트로 분리했다.
export function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm ${
        isActive
          ? "bg-zinc-200 font-medium text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {children}
    </Link>
  );
}
