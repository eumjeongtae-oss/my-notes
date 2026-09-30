import Link from "next/link";

import { getExcerpt } from "@/lib/markdown";
import type { Note } from "@/lib/notes";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function NoteCard({ note }: { note: Note }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-1 text-lg font-bold">{note.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">
          {getExcerpt(note.content)}
        </p>
      </div>
      <div className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
        {dateFormat.format(note.updatedAt)}
      </div>
    </Link>
  );
}
