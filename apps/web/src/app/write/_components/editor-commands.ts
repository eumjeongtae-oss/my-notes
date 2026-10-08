import { EditorSelection, type EditorView } from "@uiw/react-codemirror";

// 툴바 버튼이 실행하는 마크다운 편집 명령들.
// CodeMirror는 문서를 직접 고치지 않고, "무엇을 바꿀지(changes)"를 dispatch해서 바꾼다.
// React의 setState처럼 변경을 요청하면 에디터가 알아서 반영하는 방식이다.

// 현재 줄 맨 앞에 붙은 기호(#, >)를 prefix로 바꾼다. 이미 같은 기호면 제거한다(토글).
function toggleLinePrefix(view: EditorView, prefix: string, pattern: RegExp) {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const existing = pattern.exec(line.text)?.[0] ?? "";

  view.dispatch({
    changes: {
      from: line.from,
      to: line.from + existing.length,
      insert: existing === prefix ? "" : prefix,
    },
  });
  view.focus();
}

export function toggleHeading(view: EditorView, level: 1 | 2 | 3 | 4) {
  toggleLinePrefix(view, `${"#".repeat(level)} `, /^#{1,6} /);
}

export function toggleQuote(view: EditorView) {
  toggleLinePrefix(view, "> ", /^> /);
}

// 선택한 글자를 before, after로 감싼다. 선택이 없으면 placeholder를 넣고 그 부분을 선택한다.
export function wrapSelection(
  view: EditorView,
  before: string,
  after = before,
  placeholder = "텍스트",
) {
  view.dispatch(
    view.state.changeByRange((range) => {
      const text = view.state.sliceDoc(range.from, range.to) || placeholder;
      const start = range.from + before.length;
      return {
        changes: {
          from: range.from,
          to: range.to,
          insert: `${before}${text}${after}`,
        },
        range: EditorSelection.range(start, start + text.length),
      };
    }),
  );
  view.focus();
}

// [글자](https://) 형태로 넣고, 바로 주소를 입력할 수 있게 https:// 부분을 선택한다.
// (이미지는 주소를 직접 쓰지 않고 업로드한다: use-image-upload.ts)
export function insertLink(view: EditorView) {
  const url = "https://";
  view.dispatch(
    view.state.changeByRange((range) => {
      const text = view.state.sliceDoc(range.from, range.to) || "링크 텍스트";
      const opening = `[${text}](`;
      const urlStart = range.from + opening.length;
      return {
        changes: {
          from: range.from,
          to: range.to,
          insert: `${opening}${url})`,
        },
        range: EditorSelection.range(urlStart, urlStart + url.length),
      };
    }),
  );
  view.focus();
}

// 코드 블록(```)으로 감싼다. 줄 중간이면 줄을 바꾼 뒤에 넣는다.
export function insertCodeBlock(view: EditorView) {
  view.dispatch(
    view.state.changeByRange((range) => {
      const text = view.state.sliceDoc(range.from, range.to) || "코드";
      const atLineStart = view.state.doc.lineAt(range.from).from === range.from;
      const before = `${atLineStart ? "" : "\n"}\`\`\`\n`;
      const start = range.from + before.length;
      return {
        changes: {
          from: range.from,
          to: range.to,
          insert: `${before}${text}\n\`\`\``,
        },
        range: EditorSelection.range(start, start + text.length),
      };
    }),
  );
  view.focus();
}
