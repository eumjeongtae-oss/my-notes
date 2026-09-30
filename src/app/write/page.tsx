import type { Metadata } from "next";

import { NoteEditor } from "./_components/note-editor";

export const metadata: Metadata = {
  title: "새 노트",
};

// (main) 그룹 밖에 있어서 헤더 없이 전체 화면을 쓴다.
// 기존 노트 수정(/write?id=1)은 다음 단계에서 붙인다.
export default function WritePage() {
  return <NoteEditor />;
}
