import Link from "next/link";

import type { NoteSummary } from "@/api/types";
import { formatDate } from "@/lib/format";
import type { NoteView } from "@/lib/note-list-params";

// 카드형(grid)과 목록형(list)이 같은 카드 모양을 쓰고, 글자 크기와 요약 줄 수만 다르다.
// 요약(excerpt)은 백엔드가 만들어 보내고, 화면은 line-clamp로 보이는 줄 수만 정한다.
const styles = {
  grid: {
    body: "p-5",
    title: "line-clamp-1 text-lg",
    excerpt: "mt-2 line-clamp-3 text-sm",
    footer: "px-5 py-3 text-xs",
  },
  list: {
    body: "p-6",
    title: "line-clamp-1 text-xl",
    excerpt: "mt-3 line-clamp-2",
    footer: "px-6 py-3 text-sm",
  },
} satisfies Record<NoteView, Record<string, string>>;

export function NoteCard({
  note,
  variant = "grid",
}: {
  note: NoteSummary;
  variant?: NoteView;
}) {
  const style = styles[variant];

  return (
    <Link
      href={`/notes/${note.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`flex flex-1 flex-col ${style.body}`}>
        <h2 className={`font-bold ${style.title}`}>{note.title}</h2>
        <p className={`leading-relaxed text-zinc-600 ${style.excerpt}`}>
          {note.excerpt}
        </p>
      </div>
      <div className={`border-t border-zinc-100 text-zinc-500 ${style.footer}`}>
        {formatDate(note.createdAt)}
      </div>
    </Link>
  );
}
