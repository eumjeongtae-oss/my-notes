"use client";

import type { EditorView } from "@uiw/react-codemirror";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  Italic,
  Link,
  SquareCode,
  Strikethrough,
  TextQuote,
  type LucideIcon,
} from "lucide-react";

import {
  insertCodeBlock,
  insertImage,
  insertLink,
  toggleHeading,
  toggleQuote,
  wrapSelection,
} from "./editor-commands";

type ToolbarItem = {
  label: string;
  Icon: LucideIcon;
  run: (view: EditorView) => void;
};

// 배열의 배열: 안쪽 배열 하나가 구분선으로 나뉘는 버튼 묶음 하나다.
const groups: ToolbarItem[][] = [
  [
    { label: "제목 1", Icon: Heading1, run: (v) => toggleHeading(v, 1) },
    { label: "제목 2", Icon: Heading2, run: (v) => toggleHeading(v, 2) },
    { label: "제목 3", Icon: Heading3, run: (v) => toggleHeading(v, 3) },
    { label: "제목 4", Icon: Heading4, run: (v) => toggleHeading(v, 4) },
  ],
  [
    { label: "굵게", Icon: Bold, run: (v) => wrapSelection(v, "**") },
    { label: "기울임", Icon: Italic, run: (v) => wrapSelection(v, "_") },
    {
      label: "취소선",
      Icon: Strikethrough,
      run: (v) => wrapSelection(v, "~~"),
    },
  ],
  [
    { label: "인용", Icon: TextQuote, run: toggleQuote },
    { label: "링크", Icon: Link, run: insertLink },
    { label: "이미지", Icon: ImageIcon, run: insertImage },
    { label: "코드 블록", Icon: SquareCode, run: insertCodeBlock },
  ],
];

// getView: 버튼을 누른 순간의 에디터를 가져온다.
// 에디터는 브라우저에서 만들어지므로, 렌더링 시점이 아니라 클릭 시점에 꺼내 쓴다.
export function EditorToolbar({
  getView,
}: {
  getView: () => EditorView | undefined;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 text-zinc-500">
      {groups.map((group, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <span className="mx-2 h-5 w-px bg-zinc-200" />}
          {group.map(({ label, Icon, run }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              onClick={() => {
                const view = getView();
                if (view) run(view);
              }}
              className="rounded-md p-2 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
