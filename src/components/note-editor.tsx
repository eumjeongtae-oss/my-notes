"use client";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useState } from "react";

import type { Note } from "@/lib/notes";

import { MarkdownPreview } from "./markdown-preview";

// 컴포넌트 밖에 두어서 렌더링마다 새로 만들지 않는다.
// codeLanguages: 코드 블록 안의 언어(tsx, css 등)도 문법 강조한다.
const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
];

// 1단계에서는 입력 내용이 화면에만 반영되고 저장되지 않는다. 저장은 2단계(DB)에서 붙인다.
export function NoteEditor({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  return (
    <div className="flex h-full flex-col">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목 없음"
        className="border-b border-zinc-200 px-6 py-4 text-2xl font-bold outline-none placeholder:text-zinc-300"
      />
      <div className="grid min-h-0 flex-1 grid-cols-2">
        <CodeMirror
          value={content}
          onChange={setContent}
          extensions={extensions}
          basicSetup={{ foldGutter: false, lineNumbers: false }}
          height="100%"
          className="h-full overflow-hidden border-r border-zinc-200 text-sm"
        />
        <div className="overflow-y-auto px-8 py-6">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}
