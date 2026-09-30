// 앱 전체가 함께 쓰는 DB 접속 객체(PrismaClient).
//
// server-only: 이 파일을 클라이언트 컴포넌트에서 import하면 빌드 에러가 난다.
// DB 주소(비밀번호 포함)를 쓰는 코드가 브라우저로 새어 나가는 것을 막는다.
import "server-only";

import { createPrismaClient } from "./prisma-client";

// 개발 서버는 파일을 저장할 때마다 코드를 다시 불러온다(HMR).
// 그때마다 새 PrismaClient를 만들면 DB 연결이 계속 쌓여서 "Too many connections"가 난다.
// 그래서 코드를 다시 불러와도 유지되는 globalThis에 하나만 보관하고 재사용한다.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

const isDev = process.env.NODE_ENV !== "production";

// 개발 환경에서만 실행되는 SQL을 터미널에 찍는다. (운영에서는 로그가 너무 많고 데이터가 로그에 남는다)
export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient({ log: isDev ? ["query", "warn", "error"] : ["error"] });

// 운영 환경에서는 HMR이 없어서 보관할 필요가 없다.
if (isDev) {
  globalForPrisma.prisma = prisma;
}
