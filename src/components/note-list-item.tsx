import Link from "next/link";

import { getExcerpt } from "@/lib/markdown";
import type { Note } from "@/lib/notes";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// 1개씩 보기(목록형)에서 쓰는 항목. 카드보다 제목과 요약을 크게 보여준다.
export function NoteListItem({ note }: { note: Note }) {
  return (
    <Link href={`/notes/${note.id}`} className="group block py-8">
      <h2 className="text-2xl font-bold group-hover:underline">{note.title}</h2>
      <p className="mt-3 line-clamp-2 leading-relaxed text-zinc-600">
        {getExcerpt(note.content, 250)}
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        {dateFormat.format(note.updatedAt)}
      </p>
    </Link>
  );
}
