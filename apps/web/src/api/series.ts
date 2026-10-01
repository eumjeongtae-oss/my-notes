// 묶음(series) API 호출 함수 (서버 컴포넌트용). 백엔드 apps/api/src/app/api/series/** 와 짝이다.
// 화면에서는 "묶음"이라고 부른다.
import "server-only";

import { cache } from "react";

import { apiGet, apiGetOrNull } from "./client";
import {
  type SeriesDetail,
  type SeriesDetailResponse,
  type SeriesSummary,
  type SeriesSummaryResponse,
  toSeriesDetail,
  toSeriesSummary,
} from "./types";

// GET /api/series → 묶음 목록 (각 묶음의 노트 수 포함)
export async function getSeriesList(): Promise<SeriesSummary[]> {
  const { items } = await apiGet<{ items: SeriesSummaryResponse[] }>(
    "/api/series",
  );
  return items.map(toSeriesSummary);
}

// GET /api/series/:id → 묶음 하나와 속한 노트들 (순서대로)
// 없거나(404) id 형식이 틀리면(400) null → 화면에서 notFound()로 처리한다.
// cache: generateMetadata와 본문이 같은 묶음을 부를 때 API는 한 번만 호출한다.
export const getSeries = cache(
  async (id: string): Promise<SeriesDetail | null> => {
    const series = await apiGetOrNull<SeriesDetailResponse>(
      `/api/series/${encodeURIComponent(id)}`,
    );
    return series && toSeriesDetail(series);
  },
);
