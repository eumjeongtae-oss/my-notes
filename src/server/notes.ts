// 노트 데이터 접근 계층.
// 지금은 메모리의 가짜 데이터를 돌려주지만, 2단계에서 이 파일 안만 DB 조회로 바꾼다.
// 화면 코드는 이 함수들만 호출하므로 수정할 필요가 없다.

import { cache } from "react";

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
};

const notes: Note[] = [
  {
    id: "1",
    title: "my-notes 시작하기",
    content: `노션처럼 **나만 보는** 마크다운 노트 앱이다.

## 할 일

- [x] 프로젝트 이름 변경
- [x] 로드맵 작성
- [ ] 사이드바와 에디터 화면 만들기
- [ ] DB 연결하기

## 기술 스택

| 역할 | 선택 |
| --- | --- |
| 프레임워크 | Next.js 16 |
| 스타일 | Tailwind CSS 4 |
| 에디터 | CodeMirror 6 |
`,
    updatedAt: new Date("2026-09-30T10:00:00+09:00"),
  },
  {
    id: "2",
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
    updatedAt: new Date("2026-09-29T21:30:00+09:00"),
  },
  {
    id: "3",
    title: "Tailwind 자주 쓰는 클래스",
    content: `> 클래스에 마우스를 올리면 Tailwind CSS IntelliSense가 실제 CSS를 보여준다.

- 레이아웃: \`flex\`, \`grid\`, \`gap-4\`, \`items-center\`
- 여백: \`p-4\`, \`px-2\`, \`mt-8\`
- 크기: \`w-64\`, \`h-full\`, \`min-w-0\`
- 글자: \`text-sm\`, \`font-semibold\`, \`truncate\`
`,
    updatedAt: new Date("2026-09-28T15:00:00+09:00"),
  },
];

export type NoteSort = "latest" | "oldest";

// 2단계에서는 DB 쿼리의 ORDER BY updated_at DESC / ASC로 바뀐다.
export async function getNotes({
  sort = "latest",
}: { sort?: NoteSort } = {}): Promise<Note[]> {
  const direction = sort === "latest" ? -1 : 1;
  return [...notes].sort(
    (a, b) => direction * (a.updatedAt.getTime() - b.updatedAt.getTime()),
  );
}

// cache: 한 번의 요청 안에서 같은 id로 여러 번 호출해도 실제 조회는 한 번만 한다.
// (읽기 페이지에서 generateMetadata와 본문이 같은 노트를 각각 가져오기 때문)
export const getNote = cache(async (id: string): Promise<Note | undefined> => {
  return notes.find((note) => note.id === id);
});
