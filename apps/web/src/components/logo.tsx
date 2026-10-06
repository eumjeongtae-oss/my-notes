// 파비콘(src/app/icon.svg)과 같은 모양이다. 모양을 바꾸면 둘 다 고친다.
// inverted: 어두운 배경 위에 놓을 때 (로그인 페이지 왼쪽). 네모는 흰색, 막대는 짙은 색으로 뒤집는다
export function Logo({ inverted = false }: { inverted?: boolean }) {
  const bar = inverted ? "fill-zinc-900" : "fill-white";
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect
          width="32"
          height="32"
          rx="8"
          className={inverted ? "fill-white" : "fill-zinc-900"}
        />
        <rect
          x="10"
          y="8.5"
          width="12"
          height="3.5"
          rx="1.75"
          className={`${bar} opacity-45`}
        />
        <rect
          x="8"
          y="14.25"
          width="16"
          height="3.5"
          rx="1.75"
          className={`${bar} opacity-70`}
        />
        <rect x="6" y="20" width="20" height="3.5" rx="1.75" className={bar} />
      </svg>
      <span
        className={`text-xl font-bold tracking-tight ${inverted ? "text-white" : ""}`}
      >
        차곡
      </span>
    </span>
  );
}
