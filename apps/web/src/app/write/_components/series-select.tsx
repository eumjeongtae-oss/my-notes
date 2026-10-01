"use client";

// 글쓰기 화면의 묶음 선택. 화면에서는 "묶음", 코드에서는 series.
//
// HTML 기본 <select>를 쓴다. 키보드, 모바일, 스크린리더를 브라우저가 기본으로 지원한다.
// 맨 아래 "+ 새 묶음 만들기…"를 고르면 그 자리가 이름 입력칸으로 바뀌고, 만들면 바로 선택된다.
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createSeries } from "@/api/browser";

export type SeriesOption = { id: number; name: string };

// <select>의 값은 문자열이라, "묶음 없음"과 "새로 만들기"를 특별한 값으로 구분한다
const NONE = "";
const CREATE = "__create__";

export function SeriesSelect({
  options: initialOptions,
  value,
  onChange,
}: {
  options: SeriesOption[];
  value: number | null;
  onChange: (seriesId: number | null) => void;
}) {
  // 새로 만든 묶음을 목록에 바로 추가해야 해서 목록을 상태로 들고 있는다
  const [options, setOptions] = useState(initialOptions);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const createMutation = useMutation({
    mutationFn: () => createSeries(name),
    onSuccess: (series) => {
      setOptions((prev) => [series, ...prev]);
      onChange(series.id);
      setCreating(false);
      setName("");
      toast.success(`"${series.name}" 묶음을 만들었어요`);
    },
  });

  function cancelCreating() {
    setCreating(false);
    setName("");
    createMutation.reset();
  }

  if (creating) {
    return (
      <form
        // Enter로 만들 수 있게 form으로 감싼다
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") cancelCreating();
          }}
          placeholder="새 묶음 이름"
          aria-label="새 묶음 이름"
          maxLength={100}
          autoFocus
          className="w-40 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="inline-flex w-16 items-center justify-center rounded-md bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            "만들기"
          )}
        </button>
        <button
          type="button"
          onClick={cancelCreating}
          className="rounded-md px-2 py-2 text-sm text-zinc-500 hover:bg-zinc-100"
        >
          취소
        </button>
        {/* 실패 메시지(예: 같은 이름이 이미 있음)는 입력칸 옆에 보여준다 */}
        {createMutation.isError && (
          <p role="alert" className="text-sm text-red-500">
            {createMutation.error.message}
          </p>
        )}
      </form>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-500">
      묶음
      <select
        value={value === null ? NONE : String(value)}
        onChange={(event) => {
          const selected = event.target.value;
          if (selected === CREATE) {
            setCreating(true);
          } else {
            onChange(selected === NONE ? null : Number(selected));
          }
        }}
        className="max-w-48 rounded-md border border-zinc-300 bg-white py-2 pr-8 pl-3 text-sm text-zinc-900 outline-none focus:border-zinc-500"
      >
        <option value={NONE}>묶음 없음</option>
        {options.map((series) => (
          <option key={series.id} value={series.id}>
            {series.name}
          </option>
        ))}
        <option value={CREATE}>+ 새 묶음 만들기…</option>
      </select>
    </label>
  );
}
