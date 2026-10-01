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
// LIKE에서 %(아무 글자 여러 개), _(아무 글자 하나)는 특수 기호다.
// 그대로 두면 "%"로 검색했을 때 모든 노트가 나온다. 앞에 \를 붙여 "진짜 글자"로 만든다.
// (\ 자체도 이스케이프 기호라서 먼저 처리한다)
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function listNotes({ q, sort, limit, cursor }: ListNotesQuery) {
  const direction = sort === "latest" ? "desc" : "asc";
  // 최신순이면 커서보다 "작은"(더 과거), 오래된순이면 "큰"(더 최근) 것을 가져온다
  const after = sort === "latest" ? "lt" : "gt";

  // 검색 조건. 제목이나 본문에 검색어가 들어 있는 노트
  // SQL: (title LIKE %q% OR content LIKE %q%)
  // 검색어는 SQL 문장에 끼워 넣지 않고 따로 전달된다(파라미터 바인딩)라서 SQL 인젝션에 안전하다
  const keyword = q && escapeLike(q);
  const searchWhere: Prisma.NoteWhereInput | undefined = keyword
    ? {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      }
    : undefined;

  // 커서 조건. 커서 노트(작성 시각 X, id Y) 바로 다음부터
  // SQL: created_at < X OR (created_at = X AND id < Y)
  const cursorWhere: Prisma.NoteWhereInput | undefined = cursor && {
    OR: [
      { createdAt: { [after]: cursor.createdAt } },
      { createdAt: cursor.createdAt, id: { [after]: cursor.id } },
    ],
  };

  // 첫 묶음(cursor 없음)일 때만 전체 개수를 센다. 다음 묶음부터는 세지 않는다.
  // 목록 조회와 개수 세기를 동시에(Promise.all) 보내서 기다리는 시간이 늘지 않게 한다.
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      // 검색 조건과 커서 조건을 둘 다 만족하는 노트 (없는 조건은 무시된다)
      where: { AND: [searchWhere ?? {}, cursorWhere ?? {}] },
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
    }),
    // 전체 개수도 검색 조건을 적용해서 센다 ("검색 결과 3")
    cursor ? undefined : prisma.note.count({ where: searchWhere }),
  ]);

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
    // 첫 묶음에만 있다. 다음 묶음에서는 undefined라 JSON에서 빠진다
    total,
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

// 노트를 넣으려는 묶음이 없을 때 던진다. API에서 400으로 응답한다.
export class SeriesNotFoundError extends Error {
  constructor(readonly seriesId: number) {
    super(`${seriesId}번 묶음을 찾을 수 없습니다.`);
  }
}

// 트랜잭션 안에서 쓰는 Prisma 클라이언트
type Tx = Prisma.TransactionClient;

// 묶음의 맨 뒤 번호 + 1. 묶음이 없으면 SeriesNotFoundError
// SQL: SELECT MAX(series_order) FROM notes WHERE series_id = ?
async function nextSeriesOrder(tx: Tx, seriesId: number) {
  const series = await tx.series.findUnique({
    where: { id: seriesId },
    select: { id: true },
  });
  if (!series) throw new SeriesNotFoundError(seriesId);

  const { _max } = await tx.note.aggregate({
    where: { seriesId },
    _max: { seriesOrder: true },
  });
  return (_max.seriesOrder ?? 0) + 1;
}

// 노트가 묶음에서 빠지면(삭제, 다른 묶음으로 이동, 묶음 빼기) 뒤에 있던 노트들의 번호를 1씩 당긴다.
// 1, 2, 3, 4에서 2가 빠지면 1, 3, 4가 아니라 1, 2, 3이 되도록 (읽기 페이지의 "N번째"가 맞게)
// SQL: UPDATE notes SET series_order = series_order - 1 WHERE series_id = ? AND series_order > ?
async function closeSeriesGap(tx: Tx, seriesId: number, removedOrder: number) {
  await tx.note.updateMany({
    where: { seriesId, seriesOrder: { gt: removedOrder } },
    data: { seriesOrder: { decrement: 1 } },
  });
}

// 새 노트를 만든다. input은 route.ts에서 zod 규칙으로 이미 검사한 값이다.
// seriesId가 있으면 그 묶음의 맨 뒤 번호로 넣는다.
// id, createdAt, updatedAt, pinned는 DB가 기본값으로 채운다.
//
// $transaction: "맨 뒤 번호 알아내기 → 저장"을 하나로 묶는다. 중간에 실패하면 전부 없던 일이 된다.
export async function createNote(input: CreateNoteInput) {
  return prisma.$transaction(async (tx) => {
    const seriesId = input.seriesId ?? null;
    const seriesOrder = seriesId ? await nextSeriesOrder(tx, seriesId) : null;

    return tx.note.create({
      data: {
        title: input.title,
        content: input.content,
        seriesId,
        seriesOrder,
      },
      select: noteDetailSelect,
    });
  });
}

// 노트를 고친다. input에 있는 칸만 바뀐다(updatedAt은 Prisma가 자동으로 갱신).
// 그 id의 노트가 없으면 null을 돌려준다 → API에서 404로 응답한다.
//
// 묶음(seriesId)이 바뀌면:
//   같은 묶음 그대로 → 번호 그대로
//   다른 묶음으로   → 원래 묶음의 빈자리를 당기고, 새 묶음의 맨 뒤로
//   묶음 빼기(null) → 원래 묶음의 빈자리를 당기고, 번호를 비운다
export async function updateNote(id: number, input: UpdateNoteInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.note.findUnique({
      where: { id },
      select: { seriesId: true, seriesOrder: true },
    });
    if (!current) return null;

    const { seriesId, ...fields } = input;
    const data: Prisma.NoteUncheckedUpdateInput = { ...fields };

    if (seriesId !== undefined && seriesId !== current.seriesId) {
      if (current.seriesId !== null && current.seriesOrder !== null) {
        await closeSeriesGap(tx, current.seriesId, current.seriesOrder);
      }
      data.seriesId = seriesId;
      data.seriesOrder = seriesId ? await nextSeriesOrder(tx, seriesId) : null;
    }

    return tx.note.update({ where: { id }, data, select: noteDetailSelect });
  });
}

// 노트를 지운다. 지웠으면 true, 그 id의 노트가 없으면 false.
// 진짜 삭제(hard delete)다. 되돌릴 수 없으므로 화면에서 한 번 더 확인받는다.
// 묶음에 속한 노트였다면 뒤에 있던 노트들의 번호를 당긴다.
export async function deleteNote(id: number) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.note.findUnique({
      where: { id },
      select: { seriesId: true, seriesOrder: true },
    });
    if (!current) return false;

    await tx.note.delete({ where: { id } });
    if (current.seriesId !== null && current.seriesOrder !== null) {
      await closeSeriesGap(tx, current.seriesId, current.seriesOrder);
    }
    return true;
  });
}
