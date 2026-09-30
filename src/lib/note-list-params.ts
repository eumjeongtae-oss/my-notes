import type { NoteSort } from "@/server/notes";

// 홈 목록의 보기 방식과 정렬 순서를 URL 쿼리(?view=grid&sort=oldest)로 관리한다.
// URL은 사용자가 마음대로 바꿀 수 있으므로, 모르는 값이 들어오면 기본값으로 처리한다.

export type NoteView = "list" | "grid";

type SearchParamValue = string | string[] | undefined;

export function parseView(value: SearchParamValue): NoteView {
  return value === "grid" ? "grid" : "list";
}

export function parseSort(value: SearchParamValue): NoteSort {
  return value === "oldest" ? "oldest" : "latest";
}

// 기본값(list, latest)은 URL에서 빼서 주소를 깔끔하게 유지한다.
export function noteListHref({
  view,
  sort,
}: {
  view: NoteView;
  sort: NoteSort;
}): string {
  const params = new URLSearchParams();
  if (view !== "list") params.set("view", view);
  if (sort !== "latest") params.set("sort", sort);

  const query = params.toString();
  return query ? `/?${query}` : "/";
}
