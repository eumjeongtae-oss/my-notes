// 노트 API가 받는 입력의 규칙 (zod 스키마).
// 요청은 누구든 아무 모양으로나 보낼 수 있으므로, DB에 넣기 전에 여기 규칙으로 검사한다.
// 규칙의 숫자는 DB 설계(schema.prisma)와 맞춘다.
import { z } from "zod";

// title: VARCHAR(200)
const TITLE_MAX = 200;
// content: MEDIUMTEXT(최대 약 16MB). 한글은 한 글자에 3바이트라서 넉넉하게 글자 수로 제한한다
const CONTENT_MAX = 100_000;

// POST /api/notes 로 새 노트를 만들 때 받는 값
export const createNoteSchema = z.object({
  title: z
    // 값이 아예 없으면(undefined) "입력해 주세요", 글자가 아니면(숫자 등) "글자여야 합니다"
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "제목을 입력해 주세요."
          : "제목은 글자여야 합니다.",
    })
    // 앞뒤 공백을 지운 뒤 검사한다. "   "만 보내면 빈 제목으로 본다
    .trim()
    .min(1, "제목을 입력해 주세요.")
    .max(TITLE_MAX, `제목은 ${TITLE_MAX}자까지 쓸 수 있습니다.`),
  content: z
    .string("본문은 글자여야 합니다.")
    .max(
      CONTENT_MAX,
      `본문은 ${CONTENT_MAX.toLocaleString()}자까지 쓸 수 있습니다.`,
    ),
});

// 스키마에서 TypeScript 타입을 뽑아낸다. 규칙과 타입을 따로 적지 않아도 된다
// → { title: string; content: string }
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
