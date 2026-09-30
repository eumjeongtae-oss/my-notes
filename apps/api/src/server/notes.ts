// 노트 데이터 접근 계층 (서비스).
// DB에서 무엇을 어떻게 가져올지만 안다. HTTP(요청, 응답, 상태 코드)는 모른다.
// API(route.ts)는 여기 함수만 호출하고 prisma를 직접 쓰지 않는다.
import "server-only";

import { prisma } from "./db";

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
