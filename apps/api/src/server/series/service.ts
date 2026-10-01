// 묶음(series) 데이터 접근 (서비스). 화면에서는 "묶음"이라고 부른다.
// DB에서 무엇을 가져올지만 안다. HTTP는 모른다.
import "server-only";

import { Prisma } from "@/generated/prisma/client";

import { prisma } from "../db";
import type { CreateSeriesInput } from "./schema";

// 묶음 목록. 각 묶음에 노트가 몇 개 있는지(noteCount)도 함께 돌려준다.
//
// _count: "묶음 + 묶음별 노트 수"를 쿼리 한 번에 가져온다.
// 묶음마다 note.count()를 따로 부르면 묶음이 N개일 때 쿼리가 N+1번 나간다(N+1 문제).
export async function listSeries() {
  const seriesList = await prisma.series.findMany({
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

// 묶음 하나와, 거기 속한 노트들을 순서(seriesOrder)대로 돌려준다. 없으면 null.
// 묶음 하나에 노트가 아주 많을 일은 없어서 페이지네이션 없이 한 번에 준다.
export async function getSeriesById(id: number) {
  return prisma.series.findUnique({
    where: { id },
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

// 새 묶음을 만든다. 같은 이름의 묶음이 이미 있으면 null.
//
// "이 이름 있어?"를 먼저 조회하고 만들면, 조회와 만들기 사이에 같은 이름이 생길 수 있다.
// 그래서 그냥 만들어 보고, DB의 중복 금지 규칙(@unique)이 거부하면(P2002) 중복으로 판단한다.
export async function createSeries(input: CreateSeriesInput) {
  try {
    const series = await prisma.series.create({
      data: { name: input.name },
      select: { id: true, name: true, createdAt: true },
    });
    // 방금 만든 묶음에는 노트가 없다. 목록 API와 같은 모양으로 맞춘다
    return { ...series, noteCount: 0 };
  } catch (error) {
    // P2002: 중복 금지(@unique) 규칙 위반
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return null;
    }
    throw error;
  }
}
