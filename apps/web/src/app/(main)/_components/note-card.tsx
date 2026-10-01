import Link from "next/link";

import type { NoteSummary } from "@/api/types";
import { formatDate } from "@/lib/format";

// 홈 목록의 노트 카드.
// 요약(excerpt)은 백엔드가 만들어 보내고, 화면은 line-clamp로 보이는 줄 수(2줄)만 정한다.
export function NoteCard({ note }: { note: NoteSummary }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex flex-1 flex-col p-6">
        {/* 묶음에 속한 노트면 제목 위에 묶음 이름을 보여준다 (읽기 페이지와 같은 초록색) */}
        {note.series && (
          <p className="mb-1 truncate text-xs font-semibold text-emerald-600">
            {note.series.name}
          </p>
        )}
        <h2 className="line-clamp-1 text-xl font-bold">{note.title}</h2>
        <p className="mt-3 line-clamp-2 leading-relaxed text-zinc-600">
          {note.excerpt}
        </p>
      </div>
      <div className="border-t border-zinc-100 px-6 py-3 text-sm text-zinc-500">
        {formatDate(note.createdAt)}
      </div>
    </Link>
  );
}
