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

// 무한스크롤을 시험할 수 있도록 넣는 샘플 노트.
// 학습 노트(9월 30일)보다 과거로 하루에 하나씩 만든다 → 9월 29일, 28일, ... (총 SAMPLE_COUNT개)
// 제목에 [샘플]을 붙여 진짜 노트와 구분한다.
const SAMPLE_COUNT = 100;

const sampleTopics = [
  {
    title: "오늘의 회고",
    body: `오늘 한 일을 돌아본다. 잘한 점은 작게 나눠서 하나씩 끝낸 것이고, 아쉬운 점은 중간에 쉬는 시간을 놓친 것이다.

- [x] 계획한 작업 끝내기
- [ ] 내일 할 일 정리하기`,
  },
  {
    title: "책 읽고 정리",
    body: `읽은 부분에서 기억하고 싶은 문장을 옮겨 둔다.

> 좋은 코드는 읽는 사람을 위한 글이다.

다음에는 예제 코드를 직접 따라 쳐 보기로 했다.`,
  },
  {
    title: "회의 메모",
    body: `## 안건

1. 이번 주 진행 상황 공유
2. 막힌 부분과 도움이 필요한 부분

## 결정

- 다음 회의 전까지 각자 맡은 부분을 마무리한다`,
  },
  {
    title: "아이디어 메모",
    body: `떠오른 생각을 잊기 전에 적어 둔다. 노트에 **태그**를 붙이면 비슷한 노트끼리 모아 보기 편할 것 같다. 우선순위는 낮게 두고 나중에 다시 본다.`,
  },
  {
    title: "공부 계획",
    body: `| 요일 | 할 일 |
| --- | --- |
| 월 | 개념 읽기 |
| 수 | 예제 따라 하기 |
| 금 | 정리 노트 쓰기 |

한 번에 많이 하기보다 매일 조금씩 하는 게 목표다.`,
  },
];

function makeSampleNotes(startId: number, userId: number) {
  return Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const topic = sampleTopics[index % sampleTopics.length];
    const number = String(index + 1).padStart(3, "0");
    // 9월 29일 정오(한국 시간)부터 하루씩 과거로
    const date = new Date(
      new Date("2026-09-29T12:00:00+09:00").getTime() -
        index * 24 * 60 * 60 * 1000,
    );
    return {
      id: startId + index,
      userId,
      title: `[샘플] ${topic.title} #${number}`,
      content: topic.body,
      createdAt: date,
      updatedAt: date,
    };
  });
}

function readNote(file: string) {
  // prisma db seed는 프로젝트 루트에서 실행된다
  return readFileSync(
    path.join(process.cwd(), "prisma/seed-notes", file),
    "utf8",
  );
}

async function main() {
  // 예시 데이터의 주인: 가장 먼저 가입한 사용자 (보통 나)
  // 사용자는 Google 로그인으로만 생기므로, seed 전에 한 번 로그인해 둬야 한다
  const owner = await prisma.user.findFirst({
    orderBy: { id: "asc" },
    select: { id: true },
  });
  if (!owner) {
    throw new Error(
      "사용자가 없습니다. 먼저 http://localhost:4000/api/auth/google 에서 로그인해 주세요.",
    );
  }
  const userId = owner.id;

  // 노트가 시리즈를 참조하고 있으므로 노트부터 지운다 (사용자와 세션은 지우지 않는다. 로그인이 풀리지 않게)
  await prisma.note.deleteMany();
  await prisma.series.deleteMany();

  await prisma.series.createMany({
    data: series.map((item) => ({ ...item, userId })),
  });

  await prisma.note.createMany({
    data: notes.map((note, index) => {
      const date = new Date(`2026-09-30T${note.time}:00+09:00`);
      return {
        id: index + 1,
        userId,
        title: note.title,
        content: readNote(note.file),
        seriesId: note.series?.id,
        seriesOrder: note.series?.order,
        createdAt: date,
        updatedAt: date,
      };
    }),
  });

  // 학습 노트 다음 id부터 샘플 노트를 넣는다
  await prisma.note.createMany({
    data: makeSampleNotes(notes.length + 1, userId),
  });

  console.log(
    `시리즈 ${series.length}개, 학습 노트 ${notes.length}개, 샘플 노트 ${SAMPLE_COUNT}개를 넣었습니다.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
