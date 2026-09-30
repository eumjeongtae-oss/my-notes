import { LayoutGrid, LayoutList } from "lucide-react";
import Link from "next/link";

import { noteListHref, type NoteView } from "@/lib/note-list-params";
import type { NoteSort } from "@/lib/notes";

const sortOptions: { value: NoteSort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

const viewOptions: {
  value: NoteView;
  label: string;
  Icon: typeof LayoutList;
}[] = [
  { value: "list", label: "목록으로 보기", Icon: LayoutList },
  { value: "grid", label: "카드로 보기", Icon: LayoutGrid },
];

// 버튼이 아니라 링크다. 누르면 URL 쿼리가 바뀌고, 서버 컴포넌트가 그 값으로 다시 그린다.
// 그래서 useState도 "use client"도 필요 없다.
export function NoteListOptions({
  view,
  sort,
}: {
  view: NoteView;
  sort: NoteSort;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-3 text-sm">
        {sortOptions.map((option) => (
          <Link
            key={option.value}
            href={noteListHref({ view, sort: option.value })}
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

      <div className="flex rounded-lg bg-zinc-100 p-1">
        {viewOptions.map(({ value, label, Icon }) => (
          <Link
            key={value}
            href={noteListHref({ view: value, sort })}
            aria-label={label}
            aria-current={value === view ? "true" : undefined}
            className={`rounded-md p-1.5 ${
              value === view
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <Icon className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
