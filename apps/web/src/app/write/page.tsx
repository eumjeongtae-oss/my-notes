import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getNote } from "@/api/notes";
import { getSeriesList } from "@/api/series";

import { NoteEditor } from "./_components/note-editor";

// /write      → 새 노트
// /write?id=1 → 1번 노트 수정
//
// id가 있는데 노트를 찾을 수 없으면 새 노트로 열지 않고 404를 보여준다.
// 새 노트로 열면 "수정 중"이라고 생각하고 저장했을 때 노트가 하나 더 생겨 버린다.
async function getEditingNote(
  searchParams: PageProps<"/write">["searchParams"],
) {
  const { id } = await searchParams;
  if (id === undefined) return undefined;
  // id가 여러 개(?id=1&id=2)면 배열로 들어온다. 어느 노트인지 알 수 없으니 404
  if (typeof id !== "string") notFound();

  const note = await getNote(id);
  if (!note) notFound();
  return note;
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/write">): Promise<Metadata> {
  const note = await getEditingNote(searchParams);
  return { title: note ? `${note.title} 수정` : "새 노트" };
}

// (main) 그룹 밖에 있어서 헤더 없이 전체 화면을 쓴다.
export default async function WritePage({ searchParams }: PageProps<"/write">) {
  // 수정할 노트와 묶음 목록을 동시에 가져온다 (서로 상관없는 요청이라 Promise.all)
  const [note, seriesList] = await Promise.all([
    getEditingNote(searchParams),
    getSeriesList(),
  ]);

  // 서버에서 조회한 데이터를 props로 클라이언트 컴포넌트에 넘긴다.
  // key: /write?id=1 에서 /write?id=2 로 이동하면 같은 컴포넌트가 재사용되어
  // useState가 이전 노트 내용을 그대로 들고 있게 된다. key가 바뀌면 새로 만든다.
  return (
    <NoteEditor
      key={note?.id ?? "new"}
      initialTitle={note?.title}
      initialContent={note?.content}
      exitHref={note ? `/notes/${note.id}` : "/"}
      noteId={note?.id}
      initialSeriesId={note?.series?.id ?? null}
      seriesOptions={seriesList.map(({ id, name }) => ({ id, name }))}
    />
  );
}
