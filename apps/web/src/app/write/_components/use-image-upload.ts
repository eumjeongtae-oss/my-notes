"use client";

import { EditorView } from "@uiw/react-codemirror";
import { useCallback, useMemo, useState } from "react";

import { uploadImage } from "@/api/browser";
import { getErrorMessage } from "@/api/errors";

// 올릴 수 있는 이미지 종류 (백엔드 apps/api/src/server/images/schema.ts와 같게)
export const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

// 에디터에 이미지를 올려서 넣는 기능. 세 가지 방법이 모두 upload(files) 하나로 모인다:
//   - 툴바 이미지 버튼 (파일 선택 창)
//   - 에디터에 파일 끌어다 놓기 (드래그 앤 드롭)
//   - 복사한 이미지나 캡처 붙여넣기 (Ctrl+V)
//
// 올리는 동안 커서 자리에 "(이미지 올리는 중… cat.png)"를 먼저 넣고,
// 다 올라가면 그 글자를 ![cat](이미지 주소)로 바꾼다. 실패하면 그 글자를 지우고 error에 문구를 남긴다.
// 여러 장을 한꺼번에 올려도 각자 자기 자리를 찾아 바뀐다 (자리 표시 글자에 무작위 번호를 붙여 구분)
export function useImageUpload() {
  // 지금 올리는 중인 장 수. 0보다 크면 저장 버튼을 막는다
  const [uploadingCount, setUploadingCount] = useState(0);
  // 마지막 실패 문구 (툴바 아래 빨간 글씨). 새로 올리기 시작하면 지운다
  const [error, setError] = useState<string | null>(null);

  // useCallback: 렌더링마다 새 함수를 만들지 않는다. 아래 에디터 확장(드래그, 붙여넣기)이 이 함수를 붙잡고 있어서,
  // 함수가 매번 바뀌면 에디터 확장도 매번 새로 만들어진다
  // view: 이미지를 넣을 에디터. 툴바 버튼은 클릭할 때 꺼내서, 드래그와 붙여넣기는 에디터가 직접 넘겨준다
  const upload = useCallback((view: EditorView, files: Iterable<File>) => {
    const all = Array.from(files);
    const images = all.filter((file) => IMAGE_TYPES.includes(file.type));
    setError(
      images.length < all.length
        ? "PNG, JPG, GIF, WEBP 이미지만 올릴 수 있습니다."
        : null,
    );

    // 한 장씩 따로 올린다 (기다리지 않고 동시에)
    for (const file of images) {
      const placeholder = `(이미지 올리는 중… ${file.name} #${crypto.randomUUID().slice(0, 4)})`;
      insertOnOwnLine(view, placeholder);
      setUploadingCount((count) => count + 1);

      uploadImage(file)
        .then((url) =>
          replaceText(view, placeholder, `![${altText(file.name)}](${url})`),
        )
        .catch((e: Error) => {
          replaceText(view, placeholder, "");
          setError(getErrorMessage(e));
        })
        .finally(() => setUploadingCount((count) => count - 1));
    }
  }, []);

  // 에디터에 붙이는 확장: 파일을 끌어다 놓거나 붙여넣으면 upload로 보낸다.
  // 파일이 없으면(글자를 끌어다 놓거나 붙여넣으면) false를 돌려줘서 에디터가 원래대로 처리하게 둔다
  const dropAndPaste = useMemo(
    () =>
      EditorView.domEventHandlers({
        drop(event, view) {
          const files = event.dataTransfer?.files;
          if (!files || files.length === 0) return false;
          // 브라우저 기본 동작(파일을 새 탭에 열기)을 막는다
          event.preventDefault();
          // 놓은 자리로 커서를 옮긴 뒤 넣는다
          const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
          if (pos !== null) view.dispatch({ selection: { anchor: pos } });
          upload(view, files);
          return true;
        },
        paste(event, view) {
          const files = event.clipboardData?.files;
          if (!files || files.length === 0) return false;
          event.preventDefault();
          upload(view, files);
          return true;
        },
      }),
    [upload],
  );

  return { upload, dropAndPaste, isUploading: uploadingCount > 0, error };
}

// 커서 자리에 한 줄로 넣는다. 줄 중간이면 앞에서 줄을 바꾼다 (이미지는 한 줄을 통째로 쓰는 게 읽기 좋다)
function insertOnOwnLine(view: EditorView, text: string) {
  const pos = view.state.selection.main.head;
  const atLineStart = view.state.doc.lineAt(pos).from === pos;
  const insert = `${atLineStart ? "" : "\n"}${text}\n`;
  view.dispatch({
    changes: { from: pos, insert },
    selection: { anchor: pos + insert.length },
  });
  view.focus();
}

// 문서에서 search를 찾아 replacement로 바꾼다. 그사이 사용자가 지웠으면 아무것도 하지 않는다.
// 바꾼 결과가 빈 줄로 남지 않게, 지울 때는 뒤의 줄바꿈까지 지운다
function replaceText(view: EditorView, search: string, replacement: string) {
  const doc = view.state.doc.toString();
  const from = doc.indexOf(search);
  if (from === -1) return;
  const to =
    replacement === "" && doc[from + search.length] === "\n"
      ? from + search.length + 1
      : from + search.length;
  view.dispatch({ changes: { from, to, insert: replacement } });
}

// 이미지 설명(alt): 파일 이름에서 확장자를 빼고, 마크다운 문법과 겹치는 []는 지운다
function altText(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
}
