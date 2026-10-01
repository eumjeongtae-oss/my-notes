// 글쓰기 화면의 묶음 입력칸. 화면에서는 "묶음", 코드에서는 series.
//
// velog 방식: 묶음을 따로 만들지 않는다. 이름을 쓰고 저장하면 서버가 알아서 처리한다.
//   기존 묶음 이름 → 그 묶음 맨 뒤로 / 새 이름 → 묶음이 새로 생김 / 비워 두면 → 묶음 없음
//
// HTML 기본 <input list> + <datalist>를 쓴다. 칸을 누르면 기존 묶음 목록이 펼쳐지고,
// 목록에서 고르거나 새 이름을 직접 쓸 수 있다. 라이브러리 없이 키보드, 모바일을 브라우저가 지원한다.
import { useId } from "react";

export function SeriesSelect({
  options,
  value,
  onChange,
}: {
  // 기존 묶음 이름들 (서버가 가져와서 넘겨준다)
  options: string[];
  value: string;
  onChange: (seriesName: string) => void;
}) {
  // <input list="...">와 <datalist id="...">를 이어 줄 id. 화면에 같은 컴포넌트가 여러 개여도 겹치지 않게 useId로 만든다
  const listId = useId();
  const name = value.trim();
  const isNew = name !== "" && !options.includes(name);

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-500">
      묶음
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        list={listId}
        placeholder="없음"
        maxLength={100}
        className="w-48 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      {/* 저장하면 새 묶음이 생긴다는 걸 미리 알려준다 (오타로 묶음이 하나 더 생기는 걸 막는다) */}
      {isNew && <span className="text-emerald-600">새 묶음</span>}
    </label>
  );
}
