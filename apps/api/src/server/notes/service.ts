// 노트 데이터 접근 계층 (서비스).
// DB에서 무엇을 어떻게 가져올지만 안다. HTTP(요청, 응답, 상태 코드)는 모른다.
// API(route.ts)는 여기 함수만 호출하고 prisma를 직접 쓰지 않는다.
import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { getExcerpt } from "@/lib/markdown";

import { prisma } from "../db";
import { encodeNoteCursor } from "./cursor";
import type {
  CreateNoteInput,
  ListNotesQuery,
  UpdateNoteInput,
} from "./schema";

// 목록 카드에 보여줄 요약 길이. 카드형은 화면에서 더 짧게 자른다(line-clamp).
const EXCERPT_LENGTH = 250;

// 노트 목록을 조회한다. 본문 전체 대신 요약(excerpt)만 돌려준다.
// 노트 목록을 한 묶음(limit개)씩 조회한다. 본문 전체 대신 요약(excerpt)만 돌려준다.
// cursor가 있으면 "그 노트 다음"부터, 없으면 처음부터 가져온다 (커서 페이지네이션).
// 돌려주는 nextCursor를 다음 요청에 넣으면 이어서 가져온다. 마지막 묶음이면 nextCursor는 null.
export async function listNotes({ sort, limit, cursor }: ListNotesQuery) {
  const direction = sort === "latest" ? "desc" : "asc";
  // 최신순이면 커서보다 "작은"(더 과거), 오래된순이면 "큰"(더 최근) 것을 가져온다
  const after = sort === "latest" ? "lt" : "gt";

  const notes = await prisma.note.findMany({
    // SQL: WHERE created_at < X OR (created_at = X AND id < Y)
    //      → 커서 노트(작성 시각 X, id Y) 바로 다음부터
    where: cursor && {
      OR: [
        { createdAt: { [after]: cursor.createdAt } },
        { createdAt: cursor.createdAt, id: { [after]: cursor.id } },
      ],
    },
    // 작성 시각 기준으로 정렬한다. 수정해도 순서가 바뀌지 않는다.
    // 작성 시각이 같으면 id로 한 번 더 정렬해서 항상 같은 순서가 나오게 한다.
    // (커서로 "어디까지 봤는지"를 정확히 이어가려면 순서가 고정돼야 한다)
    orderBy: [{ createdAt: direction }, { id: direction }],
    // 하나 더 가져와서 "다음 묶음이 있는지" 알아낸다. 개수를 세는 쿼리가 따로 필요 없다
    take: limit + 1,
    select: {
      id: true,
      title: true,
      // 요약을 만들기 위해 DB에서는 본문을 가져오지만, 응답에는 넣지 않는다
      content: true,
      createdAt: true,
      series: { select: { id: true, name: true } },
    },
  });

  const hasNext = notes.length > limit;
  const page = hasNext ? notes.slice(0, limit) : notes;
  const last = page.at(-1);

  return {
    items: page.map(({ content, ...note }) => ({
      ...note,
      excerpt: getExcerpt(content, EXCERPT_LENGTH),
    })),
    // 다음 묶음이 있으면 이번 묶음의 마지막 노트가 다음 요청의 기준이 된다
    nextCursor: hasNext && last ? encodeNoteCursor(last) : null,
  };
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

// 노트를 지운다. 지웠으면 true, 그 id의 노트가 없으면 false.
// 진짜 삭제(hard delete)다. 되돌릴 수 없으므로 화면에서 한 번 더 확인받는다.
export async function deleteNote(id: number) {
  try {
    await prisma.note.delete({ where: { id } });
    return true;
  } catch (error) {
    // P2025: 지우려는 줄을 찾을 수 없음
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return false;
    }
    throw error;
  }
}
