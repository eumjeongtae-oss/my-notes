// 무한스크롤용 커서. "마지막으로 본 노트"의 작성 시각과 id를 묶어 알아볼 수 없는 문자열로 만든다.
//
// 프론트는 커서의 뜻을 몰라도 되고, 받은 nextCursor를 다음 요청에 그대로 돌려주기만 한다.
// (불투명한 커서. 나중에 커서 내용을 바꿔도 프론트를 고칠 필요가 없다)
//
// 작성 시각만 쓰면 같은 시각에 쓴 노트가 여러 개일 때 어디까지 봤는지 헷갈리므로 id도 함께 넣는다.
// 정렬도 [createdAt, id] 순서라서 둘이 짝을 이룬다.

export type NoteCursor = { createdAt: Date; id: number };

// { createdAt, id } → "MjAyNi0wOS0yOVQwMzowMDowMC4wMDBaXzIx" 같은 문자열
export function encodeNoteCursor({ createdAt, id }: NoteCursor): string {
  return Buffer.from(`${createdAt.toISOString()}_${id}`).toString("base64url");
}

// 문자열 → { createdAt, id }. 형식이 틀리면 null (누가 아무 값이나 넣을 수 있으므로 검사한다)
export function decodeNoteCursor(cursor: string): NoteCursor | null {
  const decoded = Buffer.from(cursor, "base64url").toString("utf8");
  const [isoDate, rawId] = decoded.split("_");

  const createdAt = new Date(isoDate);
  const id = Number(rawId);
  if (Number.isNaN(createdAt.getTime()) || !Number.isInteger(id) || id <= 0) {
    return null;
  }
  return { createdAt, id };
}
