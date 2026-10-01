"use client";

// 홈의 노트 검색창. 입력을 멈추고 0.3초가 지나면 URL의 ?q=를 바꾼다.
// URL이 바뀌면 서버가 검색 결과의 첫 묶음을 다시 가져온다 (정렬과 같은 방식).
//
// 디바운스: 한 글자마다 검색하면 "docker" 하나에 요청이 6번 나간다.
//          입력할 때마다 타이머를 다시 시작해서, 손을 뗀 뒤 한 번만 검색한다.
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { noteListHref, type NoteSort } from "@/lib/note-list-params";

const DEBOUNCE_MS = 300;

export function NoteSearch({ q, sort }: { q: string; sort: NoteSort }) {
  const router = useRouter();
  // 입력창의 값. URL(q)과 따로 들고 있어야 0.3초를 기다리는 동안에도 입력이 바로 보인다
  const [value, setValue] = useState(q);

  useEffect(() => {
    const keyword = value.trim();
    // 이미 URL에 있는 검색어와 같으면 아무것도 하지 않는다 (처음 화면이 열렸을 때 등)
    if (keyword === q) return;

    const timer = setTimeout(() => {
      // replace: 한 글자마다 방문 기록이 쌓이지 않게 지금 기록을 바꾼다 (push면 뒤로 가기를 여러 번 눌러야 함)
      // scroll: false: 검색어가 바뀌어도 스크롤 위치를 맨 위로 튀게 하지 않는다
      router.replace(noteListHref({ q: keyword, sort }), {
        scroll: false,
      });
    }, DEBOUNCE_MS);

    // 0.3초 안에 다시 입력하면 이전 타이머를 취소한다 → 마지막 입력 후 한 번만 검색
    return () => clearTimeout(timer);
  }, [value, q, sort, router]);

  return (
    <div className="relative w-full max-w-xs">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        // Esc를 누르면 검색어를 지운다
        onKeyDown={(event) => {
          if (event.key === "Escape") setValue("");
        }}
        placeholder="노트 검색"
        aria-label="노트 검색"
        maxLength={100}
        // [&::-webkit-search-cancel-button]:hidden: 브라우저 기본 X 버튼을 숨기고 아래의 X 버튼을 쓴다
        className="w-full rounded-full bg-zinc-100 py-2 pr-9 pl-9 text-sm outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-300 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="검색어 지우기"
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
