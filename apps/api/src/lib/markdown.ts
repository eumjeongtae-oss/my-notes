// 목록 API가 본문 전체 대신 보낼 요약문을 만든다.
// (apps/web/src/lib/markdown.ts에서 옮겨 왔다. 홈을 API로 바꾸면 web 쪽은 삭제한다)
// 마크다운 기호(#, **, `, 링크, 이미지 등)를 걷어내고 앞부분만 자른다.
export function getExcerpt(content: string, length = 150): string {
  const text = content
    .replace(/```[\s\S]*?```/g, "") // 코드 블록
    .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, "") // 표 구분선 (| --- | --- |)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 링크는 글자만 남김
    .replace(/^\s*(#{1,6}|>|-|\*|\d+\.)\s+/gm, "") // 제목, 인용, 목록 기호
    .replace(/\[[ x]\]\s*/g, "") // 체크박스
    .replace(/[*_`~|]/g, "") // 강조, 코드, 표 기호
    .replace(/\s+/g, " ")
    .trim();

  return text.length > length ? `${text.slice(0, length)}…` : text;
}
