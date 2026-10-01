"use client";

// 오른쪽 아래에 떠 있는 "맨 위로" 버튼. 어느 정도 내렸을 때만 나타난다.
//
// "얼마나 내렸는지"는 scroll 이벤트로 계산하지 않고 IntersectionObserver로 안다.
// 페이지 맨 위에 높이 400px짜리 보이지 않는 칸을 두고, 그 칸이 화면에서 사라지면(400px 넘게 내리면) 버튼을 보여준다.
// (무한스크롤의 감지용 칸과 같은 방법)
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ScrollToTopButton() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      // 맨 위의 칸이 화면에 안 보이면 = 400px 넘게 내렸으면 버튼을 보여준다
      setVisible(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  function scrollToTop() {
    // 운영체제에서 "동작 줄이기"를 켠 사용자에게는 부드러운 스크롤 대신 바로 이동한다
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <>
      {/* 페이지 맨 위 400px를 차지하는 보이지 않는 칸. 클릭을 가로채지 않게 pointer-events-none */}
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-[400px] w-px"
      />

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로"
        // 숨겨져 있을 때는 Tab으로도 닿지 않게 한다
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        className={`fixed right-6 bottom-6 z-10 flex size-12 items-center justify-center rounded-full bg-white text-zinc-700 shadow-lg ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:text-zinc-900 ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp className="size-5" />
      </button>
    </>
  );
}
