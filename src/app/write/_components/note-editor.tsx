"use client";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { MarkdownPreview } from "@/components/markdown-preview";

// 컴포넌트 밖에 두어서 렌더링마다 새로 만들지 않는다.
const extensions = [
  // codeLanguages: 코드 블록 안의 언어(tsx, css 등)도 문법 강조한다.
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
  // CodeMirror는 Tailwind 클래스가 닿지 않는 내부 요소가 많아서, 전용 theme으로 스타일을 준다.
  EditorView.theme({
    "&": { fontSize: "1.125rem", backgroundColor: "transparent" },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "inherit", lineHeight: "1.75" },
    ".cm-content": { padding: "0 0 4rem" },
    ".cm-line": { padding: "0" },
  }),
];

export function NoteEditor({
  initialTitle = "",
  initialContent = "",
}: {
  initialTitle?: string;
  initialContent?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  return (
    <div className="flex h-full">
      {/* 왼쪽: 작성 영역 */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col px-6 pt-8 sm:px-12">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="text-4xl font-bold outline-none placeholder:text-zinc-300"
          />
          <hr className="my-6 w-16 rounded-full border-t-[6px] border-zinc-700" />
          <CodeMirror
            value={content}
            onChange={setContent}
            extensions={extensions}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              highlightActiveLine: false,
              highlightActiveLineGutter: false,
            }}
            placeholder="당신의 이야기를 적어보세요..."
            height="100%"
            className="min-h-0 flex-1"
          />
        </div>

        {/* 하단 바 */}
        <footer className="flex h-16 shrink-0 items-center justify-between px-4 shadow-[0_0_8px_rgba(0,0,0,0.1)]">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-lg hover:bg-zinc-100"
          >
            <ArrowLeft className="size-5" />
            나가기
          </Link>
          {/* 저장은 2단계(DB)에서 Server Action으로 붙인다 */}
          <button
            type="button"
            disabled
            title="DB를 연결한 뒤 동작합니다"
            className="rounded-md bg-emerald-500 px-5 py-2 text-lg font-bold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            저장
          </button>
        </footer>
      </section>

      {/* 오른쪽: 미리보기. md(768px) 미만에서는 숨긴다 */}
      <section className="hidden min-w-0 flex-1 overflow-y-auto bg-zinc-50 px-12 py-8 md:block">
        <h1 className="mb-16 text-4xl font-bold break-keep">{title}</h1>
        <MarkdownPreview content={content} className="prose-lg" />
      </section>
    </div>
  );
}
