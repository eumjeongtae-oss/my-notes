// React Query가 데이터를 기억할 때 쓰는 이름표(query key)를 한 곳에 모은다.
// 문자열을 파일마다 직접 쓰면 오타 하나로 "지웠는데 안 지워지는" 버그가 생기기 쉽다.
import type { NoteSort } from "@/lib/note-list-params";

export const noteKeys = {
  // 노트 목록 전체 (최신순, 오래된순 모두). 지울 때는 이걸로 한 번에 지운다
  lists: () => ["notes"] as const,
  // 검색어, 정렬별 목록 (검색 결과도 따로 기억한다)
  list: (sort: NoteSort, q: string) => ["notes", sort, q] as const,
};
