import { parseSort, parseView } from "@/lib/note-list-params";
import { getNotes } from "@/server/notes";

import { EmptyNotes } from "./_components/empty-notes";
import { NoteCard } from "./_components/note-card";
import { NoteListOptions } from "./_components/note-list-options";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const view = parseView(params.view);
  const sort = parseSort(params.sort);
  const notes = await getNotes({ sort });

  if (notes.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4">
        <EmptyNotes />
      </div>
    );
  }

  // 목록형은 한 줄이 너무 길면 읽기 어려워서 폭을 좁힌다.
  return (
    <div
      className={`mx-auto px-4 py-10 ${view === "grid" ? "max-w-5xl" : "max-w-3xl"}`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          전체 노트{" "}
          <span className="text-base font-medium text-zinc-400">
            {notes.length}
          </span>
        </h1>
        <NoteListOptions view={view} sort={sort} />
      </div>

      {view === "grid" ? (
        // 화면 폭에 따라 한 줄에 1개 → 2개(sm, 640px 이상) → 3개(lg, 1024px 이상)
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}
