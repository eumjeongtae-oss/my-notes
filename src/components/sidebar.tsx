import { getNotes } from "@/lib/notes";

import { SidebarLink } from "./sidebar-link";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
});

// 서버 컴포넌트: 데이터를 서버에서 바로 가져온다. useEffect나 로딩 상태가 필요 없다.
export async function Sidebar() {
  const notes = await getNotes();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
      <div className="px-4 py-3 text-sm font-semibold text-zinc-700">
        my-notes
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="space-y-0.5">
          {notes.map((note) => (
            <li key={note.id}>
              <SidebarLink href={`/notes/${note.id}`}>
                <span className="truncate">{note.title}</span>
                <span className="shrink-0 text-xs text-zinc-400">
                  {dateFormat.format(note.updatedAt)}
                </span>
              </SidebarLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
