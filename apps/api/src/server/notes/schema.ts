// 노트 API가 받는 입력의 규칙 (zod 스키마).
// 요청은 누구든 아무 모양으로나 보낼 수 있으므로, DB에 넣기 전에 여기 규칙으로 검사한다.
// 규칙의 숫자는 DB 설계(schema.prisma)와 맞춘다.
import { z } from "zod";

import { decodeNoteCursor } from "./cursor";

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

// PATCH /api/notes/:id 로 노트를 고칠 때 받는 값.
// 저장 규칙을 그대로 쓰되, 모든 칸을 "보내도 되고 안 보내도 되게"(partial) 바꾼다.
// 보낸 칸만 고치고, 보낸 칸은 저장할 때와 똑같은 규칙으로 검사한다.
export const updateNoteSchema = createNoteSchema
  .partial()
  // 아무 칸도 안 보내면({}) 고칠 게 없으므로 막는다
  .refine((input) => Object.keys(input).length > 0, {
    error: "고칠 내용(title 또는 content)을 하나 이상 보내 주세요.",
  });

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// MySQL INT 칸의 최댓값. 이보다 큰 id는 존재할 수 없다.
const MAX_INT = 2_147_483_647;

// URL의 노트 id (/api/notes/:id). URL에서 온 값은 항상 문자열이다.
// Number()부터 쓰면 "1e1"(→10), "0x13"(→19)도 숫자로 바뀌어 통과해 버리므로
// "0이 아닌 숫자로 시작하는 숫자만"인지 문자열로 먼저 확인한 뒤 숫자로 바꾼다.
export const noteIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "노트 id는 1 이상의 정수여야 합니다.")
  .transform(Number)
  .refine((id) => id <= MAX_INT, "노트 id는 1 이상의 정수여야 합니다.");

// GET /api/notes 목록 요청의 쿼리 (?sort=latest&limit=20&cursor=...)
// URL 쿼리는 전부 문자열로 오므로, limit은 숫자로 바꾸고(coerce) cursor는 풀어서(decode) 검사한다.
export const listNotesQuerySchema = z.object({
  sort: z
    .enum(["latest", "oldest"], "sort는 latest, oldest 중 하나여야 합니다.")
    .default("latest"),
  limit: z.coerce
    .number("limit은 숫자여야 합니다.")
    .int("limit은 정수여야 합니다.")
    .min(1, "limit은 1 이상이어야 합니다.")
    .max(50, "limit은 50 이하여야 합니다.")
    .default(20),
  // 첫 페이지는 cursor 없이 요청한다. 있으면 { createdAt, id }로 풀어서 넘긴다
  cursor: z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (value === undefined) return undefined;
      const cursor = decodeNoteCursor(value);
      if (!cursor) {
        ctx.addIssue({
          code: "custom",
          message: "cursor가 올바르지 않습니다.",
        });
        return z.NEVER;
      }
      return cursor;
    }),
});

export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
