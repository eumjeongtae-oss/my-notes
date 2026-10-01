import Link from "next/link";

import { noteListHref, type NoteSort } from "@/lib/note-list-params";

const sortOptions: { value: NoteSort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

// 정렬 선택. 버튼이 아니라 링크다. 누르면 URL 쿼리가 바뀌고, 서버 컴포넌트가 그 값으로 다시 그린다.
// 그래서 useState도 "use client"도 필요 없다.
export function NoteListOptions({ q, sort }: { q: string; sort: NoteSort }) {
  return (
    <div className="flex gap-3 text-sm">
      {sortOptions.map((option) => (
        <Link
          key={option.value}
          href={noteListHref({ q, sort: option.value })}
          aria-current={option.value === sort ? "true" : undefined}
          className={
            option.value === sort
              ? "font-semibold text-zinc-900"
              : "text-zinc-400 hover:text-zinc-700"
          }
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
