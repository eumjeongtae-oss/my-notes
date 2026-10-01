// 노트 데이터 접근 계층 (서비스).
// DB에서 무엇을 어떻게 가져올지만 안다. HTTP(요청, 응답, 상태 코드)는 모른다.
// API(route.ts)는 여기 함수만 호출하고 prisma를 직접 쓰지 않는다.
import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { getExcerpt } from "@/lib/markdown";

import { prisma } from "../db";
import type { CreateNoteInput, UpdateNoteInput } from "./schema";

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

// 노트 하나를 돌려줄 때 고르는 칸. 조회(GET)와 저장(POST) 응답이 같은 모양이 되도록 함께 쓴다.
// 필요한 칸만 고른다. 응답에 무엇이 나가는지 여기서 명확히 보인다.
const noteDetailSelect = {
  id: true,
  title: true,
  content: true,
  seriesOrder: true,
  createdAt: true,
  updatedAt: true,
  // 연결된 시리즈의 id와 이름도 같이 가져온다 (SQL의 JOIN)
  series: { select: { id: true, name: true } },
} satisfies Prisma.NoteSelect;

// 노트 하나를 조회한다. 없으면 null.
export async function getNoteById(id: number) {
  return prisma.note.findUnique({
    where: { id },
    select: noteDetailSelect,
  });
}

// 새 노트를 만든다. input은 route.ts에서 zod 규칙으로 이미 검사한 값이다.
// id, createdAt, updatedAt, pinned는 DB가 기본값으로 채운다.
export async function createNote(input: CreateNoteInput) {
  return prisma.note.create({
    data: { title: input.title, content: input.content },
    select: noteDetailSelect,
  });
}

// 노트를 고친다. input에 있는 칸만 바뀐다(updatedAt은 Prisma가 자동으로 갱신).
// 그 id의 노트가 없으면 null을 돌려준다 → API에서 404로 응답한다.
export async function updateNote(id: number, input: UpdateNoteInput) {
  try {
    return await prisma.note.update({
      where: { id },
      data: input,
      select: noteDetailSelect,
    });
  } catch (error) {
    // P2025: "고치려는 줄을 찾을 수 없다"는 Prisma 에러 코드
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }
    throw error;
  }
}
