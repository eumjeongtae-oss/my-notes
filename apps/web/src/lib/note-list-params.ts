// 홈 목록 정렬. 백엔드 GET /api/notes?sort= 에 그대로 넘긴다.
export type NoteSort = "latest" | "oldest";

// 홈 목록의 검색어와 정렬 순서를 URL 쿼리(?q=docker&sort=oldest)로 관리한다.
// URL은 사용자가 마음대로 바꿀 수 있으므로, 모르는 값이 들어오면 기본값으로 처리한다.

type SearchParamValue = string | string[] | undefined;

// 백엔드 검색어 제한과 맞춘다
const QUERY_MAX = 100;

export function parseSort(value: SearchParamValue): NoteSort {
  return value === "oldest" ? "oldest" : "latest";
}

// 검색어. 앞뒤 공백을 지우고 100자로 자른다. 없거나 비면 "" (검색 안 함)
export function parseQuery(value: SearchParamValue): string {
  return typeof value === "string" ? value.trim().slice(0, QUERY_MAX) : "";
}

// 기본값(검색어 없음, latest)은 URL에서 빼서 주소를 깔끔하게 유지한다.
export function noteListHref({
  q = "",
  sort,
}: {
  q?: string;
  sort: NoteSort;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (sort !== "latest") params.set("sort", sort);

  const query = params.toString();
  return query ? `/?${query}` : "/";
}
