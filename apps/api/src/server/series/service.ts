// 묶음(series) 데이터 접근 (서비스). 화면에서는 "묶음"이라고 부른다.
// DB에서 무엇을 가져올지만 안다. HTTP는 모른다.
// 모든 함수는 userId(로그인한 사용자)를 받아서 그 사람의 묶음만 다룬다.
import "server-only";

import { prisma } from "../db";

// 내 묶음 목록. 각 묶음에 노트가 몇 개 있는지(noteCount)도 함께 돌려준다.
//
// _count: "묶음 + 묶음별 노트 수"를 쿼리 한 번에 가져온다.
// 묶음마다 note.count()를 따로 부르면 묶음이 N개일 때 쿼리가 N+1번 나간다(N+1 문제).
export async function listSeries(userId: number) {
  const seriesList = await prisma.series.findMany({
    where: { userId },
    // 최근에 만든 묶음이 먼저. 같은 시각이면 id로 한 번 더 정렬해서 순서를 고정한다
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { notes: true } },
    },
  });

  return seriesList.map(({ _count, ...series }) => ({
    ...series,
    noteCount: _count.notes,
  }));
}

// 내 묶음 하나와, 거기 속한 노트들을 순서(seriesOrder)대로 돌려준다. 없거나 남의 묶음이면 null.
// 묶음 하나에 노트가 아주 많을 일은 없어서 페이지네이션 없이 한 번에 준다.
export async function getSeriesById(userId: number, id: number) {
  return prisma.series.findUnique({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      notes: {
        // 순서가 같으면(또는 비어 있으면) 먼저 쓴 노트가 앞에 오게 한다
        orderBy: [{ seriesOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: { id: true, title: true, seriesOrder: true, createdAt: true },
      },
    },
  });
}
