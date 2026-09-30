// 개발용 예시 데이터를 DB에 넣는다. 실행: pnpm prisma db seed
// 기존 데이터를 모두 지우고 다시 넣으므로, 몇 번을 실행해도 같은 상태가 된다.
// ⚠️ 개발 DB 전용이다. 운영 DB에서 실행하면 데이터가 모두 지워진다.
//
// 노트 본문은 prisma/seed-notes/*.md에 있다. 코드 안에 긴 마크다운을 넣으면
// 백틱을 모두 이스케이프해야 해서 읽고 고치기 어렵기 때문이다.

import "dotenv/config";

import { readFileSync } from "node:fs";
import path from "node:path";

import { createPrismaClient } from "../src/server/prisma-client";

const prisma = createPrismaClient();

// id는 직접 지정해서 seed를 다시 돌려도 /notes/1 같은 주소가 바뀌지 않게 한다.
const series = [
  { id: 1, name: "my-notes 개발기" },
  { id: 2, name: "Next.js 기초" },
  { id: 3, name: "Tailwind 기초" },
  { id: 4, name: "실무 습관" },
  { id: 5, name: "DB 입문" },
];

type SeedNote = {
  file: string;
  title: string;
  // 한국 시간 기준 작성 시각 (오늘 공부한 순서)
  time: string;
  series?: { id: number; order: number };
};

const notes: SeedNote[] = [
  {
    file: "01-project-start.md",
    title: "프로젝트 시작: 목표와 방향 정하기",
    time: "09:10",
    series: { id: 1, order: 1 },
  },
  {
    file: "02-git-branch-commit.md",
    title: "git 브랜치와 커밋 메시지",
    time: "09:30",
    series: { id: 4, order: 1 },
  },
  {
    file: "03-app-router-folders.md",
    title: "App Router 폴더 규칙",
    time: "10:00",
    series: { id: 2, order: 1 },
  },
  {
    file: "04-server-client-components.md",
    title: "서버 컴포넌트와 클라이언트 컴포넌트",
    time: "10:20",
    series: { id: 2, order: 2 },
  },
  {
    file: "05-tailwind-basics.md",
    title: "Tailwind 자주 쓰는 클래스",
    time: "10:40",
    series: { id: 3, order: 1 },
  },
  {
    file: "06-home-and-read-pages.md",
    title: "velog식 홈과 읽기 화면 만들기",
    time: "11:00",
    series: { id: 1, order: 2 },
  },
  {
    file: "07-responsive-and-variants.md",
    title: "반응형과 variant",
    time: "11:20",
    series: { id: 3, order: 2 },
  },
  {
    file: "08-url-state-search-params.md",
    title: "URL로 상태 관리하기 (searchParams)",
    time: "11:40",
    series: { id: 2, order: 3 },
  },
  {
    file: "09-metadata-and-cache.md",
    title: "generateMetadata와 React cache",
    time: "12:00",
    series: { id: 2, order: 4 },
  },
  {
    file: "10-timezone-bug.md",
    title: "시간대 버그: 저장은 UTC, 표시는 한국 시간",
    time: "12:20",
    series: { id: 4, order: 2 },
  },
  {
    file: "11-layout-tricks.md",
    title: "레이아웃 트릭: 음수 마진과 min-h-0",
    time: "13:00",
    series: { id: 3, order: 3 },
  },
  {
    file: "12-write-page-and-toolbar.md",
    title: "글쓰기 화면과 에디터 툴바",
    time: "13:20",
    series: { id: 1, order: 3 },
  },
  {
    file: "13-line-endings.md",
    title: "줄바꿈 CRLF와 .gitattributes",
    time: "13:40",
    series: { id: 4, order: 3 },
  },
  {
    file: "14-merge-no-ff.md",
    title: "브랜치 합치기와 merge --no-ff",
    time: "14:00",
    series: { id: 4, order: 4 },
  },
  {
    file: "15-docker-basics.md",
    title: "Docker 기본 개념과 compose.yaml",
    time: "14:30",
    series: { id: 5, order: 1 },
  },
  {
    file: "16-env-files.md",
    title: ".env와 .env.example로 비밀 값 관리",
    time: "14:50",
    series: { id: 4, order: 5 },
  },
  {
    file: "17-db-tables-and-keys.md",
    title: "DB 기초: 테이블, 키, 1:N 관계",
    time: "15:10",
    series: { id: 5, order: 2 },
  },
  {
    file: "18-prisma-and-migrations.md",
    title: "Prisma 7과 마이그레이션",
    time: "15:30",
    series: { id: 5, order: 3 },
  },
  {
    file: "19-sql-basics.md",
    title: "SQL 기본 조회문",
    time: "15:50",
    series: { id: 5, order: 4 },
  },
  { file: "20-roadmap.md", title: "앞으로 할 일", time: "16:10" },
];

function readNote(file: string) {
  // prisma db seed는 프로젝트 루트에서 실행된다
  return readFileSync(
    path.join(process.cwd(), "prisma/seed-notes", file),
    "utf8",
  );
}

async function main() {
  // 노트가 시리즈를 참조하고 있으므로 노트부터 지운다
  await prisma.note.deleteMany();
  await prisma.series.deleteMany();

  await prisma.series.createMany({ data: series });

  await prisma.note.createMany({
    data: notes.map((note, index) => {
      const date = new Date(`2026-09-30T${note.time}:00+09:00`);
      return {
        id: index + 1,
        title: note.title,
        content: readNote(note.file),
        seriesId: note.series?.id,
        seriesOrder: note.series?.order,
        createdAt: date,
        updatedAt: date,
      };
    }),
  });

  console.log(
    `시리즈 ${series.length}개, 노트 ${notes.length}개를 넣었습니다.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
