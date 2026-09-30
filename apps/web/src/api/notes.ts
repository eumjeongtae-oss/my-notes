// 노트 API 호출 함수. 백엔드 apps/api/src/app/api/notes/** 와 짝이다.
import "server-only";

import { cache } from "react";

import { ApiError, apiGet } from "./client";

// 백엔드가 보내는 JSON 모양. JSON에는 날짜 타입이 없어서 날짜는 문자열로 온다.
type NoteResponse = {
  id: number;
  title: string;
  content: string;
  seriesOrder: number | null;
  createdAt: string;
  updatedAt: string;
  series: { id: number; name: string } | null;
};

// 화면에서 쓰는 모양. 날짜는 Date로 바꿔서 formatDate에 바로 넘길 수 있게 한다.
export type Note = Omit<NoteResponse, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

function toNote(response: NoteResponse): Note {
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  };
}

// GET /api/notes/:id
// 노트가 없거나(404) id 형식이 잘못되면(400, 예: /notes/abc) null을 돌려준다.
// 사용자 입장에서는 둘 다 "없는 페이지"라서, 화면에서 notFound()로 처리한다.
// 그 밖의 실패(500, 백엔드가 꺼져 있음 등)는 에러를 그대로 던진다.
//
// cache: 한 번의 페이지 요청 안에서 같은 id로 여러 번 불러도 API는 한 번만 호출한다.
// (읽기 페이지는 generateMetadata와 본문이 각각 getNote를 부른다)
export const getNote = cache(async (id: string): Promise<Note | null> => {
  try {
    return toNote(
      await apiGet<NoteResponse>(`/api/notes/${encodeURIComponent(id)}`),
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return null;
    }
    throw error;
  }
});
