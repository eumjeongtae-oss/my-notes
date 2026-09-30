import { notFound } from "next/navigation";

import { NoteEditor } from "@/components/note-editor";
import { getNote } from "@/lib/notes";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  // key가 바뀌면 React가 컴포넌트를 새로 만든다.
  // 다른 노트로 이동했을 때 이전 노트의 입력 상태가 남지 않게 하기 위함이다.
  return <NoteEditor key={note.id} note={note} />;
}
