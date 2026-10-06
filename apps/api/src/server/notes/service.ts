// 노트 데이터 접근 계층 (서비스).
// DB에서 무엇을 어떻게 가져올지만 안다. HTTP(요청, 응답, 상태 코드)는 모른다.
// API(route.ts)는 여기 함수만 호출하고 prisma를 직접 쓰지 않는다.
//
// ⚠️ 모든 함수는 userId(로그인한 사용자)를 받고, 모든 조회와 수정에 userId 조건을 붙인다.
// 하나라도 빠지면 남의 노트가 보이거나 고쳐진다. 남의 노트는 "없는 노트"처럼 다룬다(→ 404).
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

// 노트 목록을 한 묶음(limit개)씩 조회한다. 본문 전체 대신 요약(excerpt)만 돌려준다.
// cursor가 있으면 "그 노트 다음"부터, 없으면 처음부터 가져온다 (커서 페이지네이션).
// 돌려주는 nextCursor를 다음 요청에 넣으면 이어서 가져온다. 마지막 묶음이면 nextCursor는 null.
// LIKE에서 %(아무 글자 여러 개), _(아무 글자 하나)는 특수 기호다.
// 그대로 두면 "%"로 검색했을 때 모든 노트가 나온다. 앞에 \를 붙여 "진짜 글자"로 만든다.
// (\ 자체도 이스케이프 기호라서 먼저 처리한다)
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function listNotes(
  userId: number,
  { q, sort, limit, cursor }: ListNotesQuery,
) {
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
      // 내 노트 중에서 검색 조건과 커서 조건을 둘 다 만족하는 노트 (없는 조건은 무시된다)
      where: { userId, AND: [searchWhere ?? {}, cursorWhere ?? {}] },
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
    cursor
      ? undefined
      : prisma.note.count({ where: { userId, ...searchWhere } }),
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

// 내 노트 하나를 조회한다. 없거나 남의 노트면 null.
export async function getNoteById(userId: number, id: number) {
  return prisma.note.findUnique({
    where: { id, userId },
    select: noteDetailSelect,
  });
}

// 트랜잭션 안에서 쓰는 Prisma 클라이언트
type Tx = Prisma.TransactionClient;

// 내 묶음 중에서 이름으로 id를 찾는다. 그 이름의 묶음이 없으면 새로 만든다 (velog 방식).
// 묶음 이름은 사람마다 하나라서 (userId, name) 짝으로 찾는다 (schema.prisma의 @@unique([userId, name]))
// upsert: "있으면 그대로 쓰고(update: 아무것도 안 바꿈) 없으면 만든다(create)"
// SQL: SELECT id FROM series WHERE name = ? → 없으면 INSERT INTO series (name) VALUES (?)
async function findOrCreateSeriesId(tx: Tx, userId: number, name: string) {
  const series = await tx.series.upsert({
    where: { userId_name: { userId, name } },
    update: {},
    create: { userId, name },
    select: { id: true },
  });
  return series.id;
}

// 묶음의 맨 뒤 번호 + 1
// SQL: SELECT MAX(series_order) FROM notes WHERE series_id = ?
async function nextSeriesOrder(tx: Tx, seriesId: number) {
  const { _max } = await tx.note.aggregate({
    where: { seriesId },
    _max: { seriesOrder: true },
  });
  return (_max.seriesOrder ?? 0) + 1;
}

// 노트가 묶음에서 빠진 뒤에(삭제, 다른 묶음으로 이동, 묶음 빼기) 부른다.
// ① 뒤에 있던 노트들의 번호를 1씩 당긴다.
//    1, 2, 3, 4에서 2가 빠지면 1, 3, 4가 아니라 1, 2, 3이 되도록 (읽기 페이지의 "N번째"가 맞게)
//    SQL: UPDATE notes SET series_order = series_order - 1 WHERE series_id = ? AND series_order > ?
// ② 남은 노트가 없으면 묶음도 지운다. 빈 묶음은 남기지 않는다.
//    SQL: DELETE FROM series WHERE id = ? AND NOT EXISTS (SELECT * FROM notes WHERE series_id = ?)
//
// 노트를 지우거나 옮긴 "다음에" 불러야 한다. 먼저 부르면 그 노트가 아직 묶음에 남아 있어서 빈 묶음으로 보지 않는다.
async function leaveSeries(tx: Tx, seriesId: number, removedOrder: number) {
  await tx.note.updateMany({
    where: { seriesId, seriesOrder: { gt: removedOrder } },
    data: { seriesOrder: { decrement: 1 } },
  });
  // deleteMany는 조건에 맞는 것만 지운다. 노트가 남아 있으면 0개를 지우고 끝난다
  await tx.series.deleteMany({
    where: { id: seriesId, notes: { none: {} } },
  });
}

// 새 노트를 만든다. input은 route.ts에서 zod 규칙으로 이미 검사한 값이다.
// seriesName이 있으면 그 묶음(없으면 새로 만듦)의 맨 뒤 번호로 넣는다.
// id, createdAt, updatedAt, pinned는 DB가 기본값으로 채운다.
//
// $transaction: "묶음 찾기/만들기 → 맨 뒤 번호 알아내기 → 저장"을 하나로 묶는다.
// 중간에 실패하면 전부 없던 일이 된다 (묶음만 생기고 노트는 저장 안 되는 일이 없다).
export async function createNote(userId: number, input: CreateNoteInput) {
  return prisma.$transaction(async (tx) => {
    const seriesId = input.seriesName
      ? await findOrCreateSeriesId(tx, userId, input.seriesName)
      : null;
    const seriesOrder = seriesId ? await nextSeriesOrder(tx, seriesId) : null;

    return tx.note.create({
      data: {
        userId,
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
// 그 id의 노트가 없거나 남의 노트면 null을 돌려준다 → API에서 404로 응답한다.
//
// 묶음(seriesName)을 보내면:
//   같은 묶음 그대로 → 번호 그대로
//   다른 묶음으로   → 새 묶음(없으면 만듦)의 맨 뒤로. 원래 묶음은 빈자리를 당기고, 비면 지운다
//   묶음 빼기(null) → 번호를 비운다. 원래 묶음은 빈자리를 당기고, 비면 지운다
export async function updateNote(
  userId: number,
  id: number,
  input: UpdateNoteInput,
) {
  return prisma.$transaction(async (tx) => {
    // 내 노트인지 먼저 확인한다. 같은 트랜잭션 안이라 아래 update는 id만으로 찾아도 된다
    const current = await tx.note.findUnique({
      where: { id, userId },
      select: { seriesId: true, seriesOrder: true },
    });
    if (!current) return null;

    const { seriesName, ...fields } = input;
    const data: Prisma.NoteUncheckedUpdateInput = { ...fields };

    // 안 보냈으면(undefined) 묶음은 그대로 둔다
    let moved = false;
    if (seriesName !== undefined) {
      const seriesId = seriesName
        ? await findOrCreateSeriesId(tx, userId, seriesName)
        : null;
      if (seriesId !== current.seriesId) {
        moved = true;
        data.seriesId = seriesId;
        data.seriesOrder = seriesId
          ? await nextSeriesOrder(tx, seriesId)
          : null;
      }
    }

    const note = await tx.note.update({
      where: { id },
      data,
      select: noteDetailSelect,
    });

    if (moved && current.seriesId !== null && current.seriesOrder !== null) {
      await leaveSeries(tx, current.seriesId, current.seriesOrder);
    }
    return note;
  });
}

// 노트를 지운다. 지웠으면 true, 그 id의 노트가 없거나 남의 노트면 false.
// 진짜 삭제(hard delete)다. 되돌릴 수 없으므로 화면에서 한 번 더 확인받는다.
// 묶음에 속한 노트였다면 뒤에 있던 노트들의 번호를 당기고, 마지막 노트였다면 묶음도 지운다.
export async function deleteNote(userId: number, id: number) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.note.findUnique({
      where: { id, userId },
      select: { seriesId: true, seriesOrder: true },
    });
    if (!current) return false;

    await tx.note.delete({ where: { id } });
    if (current.seriesId !== null && current.seriesOrder !== null) {
      await leaveSeries(tx, current.seriesId, current.seriesOrder);
    }
    return true;
  });
}
