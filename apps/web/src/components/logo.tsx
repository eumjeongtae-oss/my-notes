// 파비콘(src/app/icon.svg)과 같은 모양이다. 모양을 바꾸면 둘 다 고친다.
export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-zinc-900" />
        <rect
          x="10"
          y="8.5"
          width="12"
          height="3.5"
          rx="1.75"
          className="fill-white/45"
        />
        <rect
          x="8"
          y="14.25"
          width="16"
          height="3.5"
          rx="1.75"
          className="fill-white/70"
        />
        <rect
          x="6"
          y="20"
          width="20"
          height="3.5"
          rx="1.75"
          className="fill-white"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight">차곡</span>
    </span>
  );
}
