"use client";

import type { EditorView } from "@uiw/react-codemirror";
import { useState } from "react";

import { uploadImage } from "@/api/browser";
import { getErrorMessage } from "@/api/errors";

// 에디터에 이미지를 올려서 넣는 기능. 툴바 버튼(파일 선택)이 쓰고, 드래그와 붙여넣기도 같은 함수를 쓴다.
//
// 올리는 동안 커서 자리에 "(이미지 올리는 중… cat.png)"를 먼저 넣고,
// 다 올라가면 그 글자를 ![cat](이미지 주소)로 바꾼다. 실패하면 그 글자를 지우고 error에 문구를 남긴다.
// 여러 장을 한꺼번에 올려도 각자 자기 자리를 찾아 바뀐다 (자리 표시 글자에 무작위 번호를 붙여 구분)
export function useImageUpload(getView: () => EditorView | undefined) {
  // 지금 올리는 중인 장 수. 0보다 크면 저장 버튼을 막는다
  const [uploadingCount, setUploadingCount] = useState(0);
  // 마지막 실패 문구 (툴바 아래 빨간 글씨). 새로 올리기 시작하면 지운다
  const [error, setError] = useState<string | null>(null);

  async function uploadOne(file: File) {
    const view = getView();
    if (!view) return;

    const placeholder = `(이미지 올리는 중… ${file.name} #${crypto.randomUUID().slice(0, 4)})`;
    insertOnOwnLine(view, placeholder);
    setUploadingCount((count) => count + 1);

    try {
      const url = await uploadImage(file);
      replaceText(view, placeholder, `![${altText(file.name)}](${url})`);
    } catch (e) {
      replaceText(view, placeholder, "");
      setError(getErrorMessage(e as Error));
    } finally {
      setUploadingCount((count) => count - 1);
    }
  }

  function upload(files: Iterable<File>) {
    setError(null);
    for (const file of files) {
      void uploadOne(file);
    }
  }

  return { upload, isUploading: uploadingCount > 0, error };
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
