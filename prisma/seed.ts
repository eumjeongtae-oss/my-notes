// 개발용 예시 데이터를 DB에 넣는다. 실행: pnpm prisma db seed
// 기존 데이터를 모두 지우고 다시 넣으므로, 몇 번을 실행해도 같은 상태가 된다.
// ⚠️ 개발 DB 전용이다. 운영 DB에서 실행하면 데이터가 모두 지워진다.

import "dotenv/config";

import { createPrismaClient } from "../src/lib/prisma-client";

const prisma = createPrismaClient();

async function main() {
  // 노트가 시리즈를 참조하고 있으므로 노트부터 지운다
  await prisma.note.deleteMany();
  await prisma.series.deleteMany();

  const frontend = await prisma.series.create({
    data: { id: 1, name: "프론트엔드 공부" },
  });

  await prisma.note.create({
    data: {
      id: 1,
      title: "my-notes 시작하기",
      content: `velog 형식으로 **나만 보는** 마크다운 노트 앱이다.

## 할 일

- [x] 프로젝트 이름 변경
- [x] 홈, 읽기, 글쓰기 화면 만들기
- [x] DB 연결하기
- [ ] 저장 기능 만들기

## 기술 스택

| 역할 | 선택 |
| --- | --- |
| 프레임워크 | Next.js 16 |
| 스타일 | Tailwind CSS 4 |
| DB | MySQL 8 + Prisma |
`,
      createdAt: new Date("2026-09-30T10:00:00+09:00"),
      updatedAt: new Date("2026-09-30T10:00:00+09:00"),
    },
  });

  await prisma.note.create({
    data: {
      id: 2,
      title: "서버 컴포넌트 정리",
      content: `- App Router의 컴포넌트는 **기본이 서버 컴포넌트**다.
- 상태, 이벤트 핸들러, 브라우저 API가 필요하면 파일 맨 위에 \`"use client"\`를 붙인다.
- \`"use client"\`는 가능한 한 **잎사귀(말단) 컴포넌트**에만 붙인다.

\`\`\`tsx
"use client";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`
`,
      seriesId: frontend.id,
      seriesOrder: 1,
      createdAt: new Date("2026-09-29T21:30:00+09:00"),
      updatedAt: new Date("2026-09-29T21:30:00+09:00"),
    },
  });

  await prisma.note.create({
    data: {
      id: 3,
      title: "Tailwind 자주 쓰는 클래스",
      content: `> 클래스에 마우스를 올리면 Tailwind CSS IntelliSense가 실제 CSS를 보여준다.

- 레이아웃: \`flex\`, \`grid\`, \`gap-4\`, \`items-center\`
- 여백: \`p-4\`, \`px-2\`, \`mt-8\`
- 크기: \`w-64\`, \`h-full\`, \`min-w-0\`
- 글자: \`text-sm\`, \`font-semibold\`, \`truncate\`
`,
      seriesId: frontend.id,
      seriesOrder: 2,
      createdAt: new Date("2026-09-28T15:00:00+09:00"),
      updatedAt: new Date("2026-09-28T15:00:00+09:00"),
    },
  });
}

main()
  .then(() => console.log("seed 완료"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
