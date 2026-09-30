import { EmptyNotes } from "@/components/empty-notes";
import { NoteCard } from "@/components/note-card";
import { getNotes } from "@/lib/notes";

export default async function HomePage() {
  const notes = await getNotes();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {notes.length === 0 ? (
        <EmptyNotes />
      ) : (
        <>
          <h1 className="text-2xl font-bold">
            전체 노트{" "}
            <span className="text-base font-medium text-zinc-400">
              {notes.length}
            </span>
          </h1>
          {/* 화면 폭에 따라 한 줄에 1개 → 2개(sm, 640px 이상) → 3개(lg, 1024px 이상) */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
