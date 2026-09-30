import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { type Prisma, PrismaClient } from "../generated/prisma/client";

// Prisma 7은 DB 드라이버를 어댑터로 따로 연결한다. MySQL은 mariadb 드라이버를 쓴다.
// 앱(src/lib/db.ts)과 seed 스크립트가 같이 쓰도록 여기서 만드는 방법만 정의한다.
// (import 경로를 상대 경로로 쓴 이유: seed는 Next.js 밖에서 실행된다)
//
// log: ["query"]를 넘기면 실행되는 SQL이 터미널에 찍힌다.
export function createPrismaClient({ log }: { log?: Prisma.LogLevel[] } = {}) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL이 설정되지 않았습니다. .env를 확인하세요.");
  }

  const adapter = new PrismaMariaDb(url);
  return new PrismaClient({ adapter, log });
}
