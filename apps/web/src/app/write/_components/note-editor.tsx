"use client";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import CodeMirror, {
  EditorView,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { createNote, updateNote } from "@/api/browser";
import { getErrorMessage } from "@/api/errors";
import { noteKeys } from "@/api/query-keys";
import { MarkdownPreview } from "@/components/markdown-preview";

import { EditorToolbar } from "./editor-toolbar";
import { SeriesSelect } from "./series-select";

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
    // 커서는 글자 위치에서 왼쪽으로 살짝 삐져나오게 그려진다.
    // 왼쪽 여백이 0이면 줄 맨 앞의 커서가 잘려서 안 보이므로 2px을 남긴다.
    // (대신 에디터를 -ml-0.5로 2px 당겨서 글자는 제목과 줄을 맞춘다)
    ".cm-content": { padding: "0 0 4rem 2px" },
    ".cm-line": { padding: "0" },
    ".cm-cursor": { borderLeftWidth: "2px", borderLeftColor: "#18181b" },
  }),
];

export function NoteEditor({
  initialTitle = "",
  initialContent = "",
  exitHref,
  noteId,
  initialSeriesName,
  seriesOptions,
}: {
  initialTitle?: string;
  initialContent?: string;
  // 나가기를 눌렀을 때 갈 곳. 새 노트면 홈, 수정 중이면 그 노트의 읽기 페이지
  exitHref: string;
  // 수정할 노트의 id. 있으면 수정(PATCH), 없으면 새 노트(POST)
  noteId?: number;
  // 처음에 들어 있는 묶음 이름 (수정 중이면 그 노트의 묶음, 새 노트면 빈 글자)
  initialSeriesName: string;
  // 기존 묶음 이름들 (서버가 가져와서 넘겨준다)
  seriesOptions: string[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [seriesName, setSeriesName] = useState(initialSeriesName);
  // 툴바가 에디터를 조작할 수 있도록 CodeMirror 인스턴스를 ref로 잡아둔다.
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const router = useRouter();

  // useMutation: 데이터를 "바꾸는" 요청(POST, PATCH, DELETE)에 쓴다.
  // 저장 중(isPending), 실패(error), 성공 후 할 일(onSuccess)을 대신 관리해 준다.
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: (input: {
      title: string;
      content: string;
      seriesName: string;
    }) =>
      noteId === undefined ? createNote(input) : updateNote(noteId, input),
    // 저장에 성공하면 토스트를 띄우고 그 노트의 읽기 페이지로 이동한다.
    // (실패 메시지는 토스트 대신 버튼 옆에 남겨서 놓치지 않게 한다)
    onSuccess: (note) => {
      // 홈 목록 기억을 지운다. 지우지 않으면 홈에 돌아갔을 때 예전 목록(새 노트 없음)이 보인다.
      // 지워 두면 홈이 서버가 새로 가져온 첫 묶음을 쓴다
      queryClient.removeQueries({ queryKey: noteKeys.lists() });
      toast.success(
        noteId === undefined ? "노트를 저장했어요" : "노트를 수정했어요",
      );
      router.push(`/notes/${note.id}`);
    },
  });

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
          <EditorToolbar getView={() => editorRef.current?.view} />
          <CodeMirror
            ref={editorRef}
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
            className="-ml-0.5 min-h-0 flex-1"
          />
        </div>

        {/* 하단 바 */}
        <footer className="flex h-16 shrink-0 items-center justify-between px-4 shadow-[0_0_8px_rgba(0,0,0,0.1)]">
          <Link
            href={exitHref}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-lg hover:bg-zinc-100"
          >
            <ArrowLeft className="size-5" />
            나가기
          </Link>
          <div className="flex items-center gap-4">
            {/* 저장할 묶음. 새 이름이면 서버가 만들고, 순서는 그 묶음의 맨 뒤 */}
            <SeriesSelect
              options={seriesOptions}
              value={seriesName}
              onChange={setSeriesName}
            />
            {/* 실패 메시지. 백엔드가 보낸 message(예: "제목을 입력해 주세요.")를 그대로 보여준다 */}
            {saveMutation.isError && (
              <p role="alert" className="text-sm text-red-500">
                {getErrorMessage(saveMutation.error)}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                saveMutation.mutate({ title, content, seriesName })
              }
              // 저장 중에는 두 번 누르지 못하게 막는다
              disabled={saveMutation.isPending}
              // aria-busy: 스크린리더에 "처리 중"이라고 알려준다
              aria-busy={saveMutation.isPending}
              // w-36: 글자가 "저장" → "저장 중…"으로 바뀌어도 버튼 폭이 그대로라 옆의 에러 메시지가 들썩이지 않는다
              className="inline-flex w-36 items-center justify-center gap-2 rounded-md bg-emerald-500 py-2 text-lg font-bold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <>
                  {/* animate-spin: Tailwind의 계속 회전하는 애니메이션 */}
                  <LoaderCircle className="size-5 animate-spin" />
                  저장 중…
                </>
              ) : (
                "저장"
              )}
            </button>
          </div>
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
