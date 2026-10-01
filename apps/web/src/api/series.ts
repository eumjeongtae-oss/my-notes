// 묶음(series) API 호출 함수 (서버 컴포넌트용). 백엔드 apps/api/src/app/api/series/** 와 짝이다.
// 화면에서는 "묶음"이라고 부른다.
import "server-only";

import { apiGet } from "./client";
import {
  type SeriesSummary,
  type SeriesSummaryResponse,
  toSeriesSummary,
} from "./types";

// GET /api/series → 묶음 목록 (각 묶음의 노트 수 포함)
export async function getSeriesList(): Promise<SeriesSummary[]> {
  const { items } = await apiGet<{ items: SeriesSummaryResponse[] }>(
    "/api/series",
  );
  return items.map(toSeriesSummary);
}
