"use client";

// 읽기 페이지의 삭제 버튼과 확인 창.
//
// 확인 창은 HTML 기본 <dialog>를 쓴다. showModal()로 열면 브라우저가 알아서
// 뒤 화면 클릭 막기, Tab 포커스를 창 안에 가두기, Esc로 닫기, 반투명 배경(::backdrop)을 해 준다.
// div로 직접 만들면 이 접근성 기능을 전부 손으로 구현해야 한다.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";

import { deleteNote } from "@/api/browser";
import { getErrorMessage } from "@/api/errors";
import { noteKeys } from "@/api/query-keys";

export function DeleteNoteButton({
  noteId,
  title,
}: {
  noteId: number;
  title: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    // 지웠으면 토스트를 띄우고 홈으로 이동한다. replace: 뒤로 가기로 지운 노트 페이지에 돌아오지 않게
    onSuccess: () => {
      // 홈 목록 기억을 지운다. 지우지 않으면 홈에 지운 노트가 남아 보인다
      queryClient.removeQueries({ queryKey: noteKeys.lists() });
      toast.success("노트를 삭제했어요");
      router.replace("/");
    },
  });

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-sm hover:text-red-600"
      >
        삭제
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-note-title"
        // 지우는 중에는 Esc로 닫히지 않게 막는다
        onCancel={(event) => {
          if (deleteMutation.isPending) event.preventDefault();
        }}
        // m-auto: Tailwind가 모든 요소의 margin을 0으로 초기화해서, 가운데 정렬을 다시 지정한다
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl p-6 shadow-xl backdrop:bg-black/40"
      >
        <h2 id="delete-note-title" className="text-lg font-bold">
          노트를 삭제할까요?
        </h2>
        <p className="mt-2 text-sm leading-relaxed break-keep text-zinc-600">
          <strong className="text-zinc-900">{title}</strong> 노트를 삭제하면
          되돌릴 수 없어요.
        </p>

        {deleteMutation.isError && (
          <p role="alert" className="mt-3 text-sm text-red-500">
            {getErrorMessage(deleteMutation.error)}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            // 되돌릴 수 없는 동작이라, 창이 열리면 "취소"에 먼저 포커스를 준다
            // (실수로 Enter를 눌러도 지워지지 않게)
            autoFocus
            onClick={() => dialogRef.current?.close()}
            disabled={deleteMutation.isPending}
            className="rounded-md px-4 py-2 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            aria-busy={deleteMutation.isPending}
            // w-24: 글자가 "삭제 중…"으로 바뀌어도 버튼 폭이 그대로
            className="inline-flex w-24 items-center justify-center gap-1.5 rounded-md bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                삭제 중…
              </>
            ) : (
              "삭제"
            )}
          </button>
        </div>
      </dialog>
    </>
  );
}
