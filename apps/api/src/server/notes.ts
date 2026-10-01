// 노트 데이터 접근 계층 (서비스).
// DB에서 무엇을 어떻게 가져올지만 안다. HTTP(요청, 응답, 상태 코드)는 모른다.
// API(route.ts)는 여기 함수만 호출하고 prisma를 직접 쓰지 않는다.
import "server-only";

import { getExcerpt } from "@/lib/markdown";

import { prisma } from "./db";

export type NoteSort = "latest" | "oldest";

// 목록 카드에 보여줄 요약 길이. 카드형은 화면에서 더 짧게 자른다(line-clamp).
const EXCERPT_LENGTH = 250;

// 노트 목록을 조회한다. 본문 전체 대신 요약(excerpt)만 돌려준다.
export async function listNotes({ sort }: { sort: NoteSort }) {
  const direction = sort === "latest" ? "desc" : "asc";

  const notes = await prisma.note.findMany({
    // 수정 시각이 같으면 id로 한 번 더 정렬해서 항상 같은 순서가 나오게 한다.
    // (무한스크롤에서 "어디까지 봤는지"를 정확히 이어가려면 순서가 고정돼야 한다)
    orderBy: [{ updatedAt: direction }, { id: direction }],
    select: {
      id: true,
      title: true,
      // 요약을 만들기 위해 DB에서는 본문을 가져오지만, 응답에는 넣지 않는다
      content: true,
      updatedAt: true,
      series: { select: { id: true, name: true } },
    },
  });

  return notes.map(({ content, ...note }) => ({
    ...note,
    excerpt: getExcerpt(content, EXCERPT_LENGTH),
  }));
}

// 노트 하나를 조회한다. 없으면 null.
export async function getNoteById(id: number) {
  return prisma.note.findUnique({
    where: { id },
    // 필요한 칸만 고른다. 응답에 무엇이 나가는지 여기서 명확히 보인다.
    select: {
      id: true,
      title: true,
      content: true,
      seriesOrder: true,
      createdAt: true,
      updatedAt: true,
      // 연결된 시리즈의 id와 이름도 같이 가져온다 (SQL의 JOIN)
      series: { select: { id: true, name: true } },
    },
  });
}
