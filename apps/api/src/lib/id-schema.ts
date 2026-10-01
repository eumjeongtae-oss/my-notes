// URL의 id(/api/notes/:id, /api/series/:id)를 검사하는 zod 규칙을 만든다.
// URL에서 온 값은 항상 문자열이다. Number()부터 쓰면 "1e1"(→10), "0x13"(→19)도 숫자로 바뀌어 통과해 버리므로
// "0이 아닌 숫자로 시작하는 숫자만"인지 문자열로 먼저 확인한 뒤 숫자로 바꾼다.
import { z } from "zod";

// MySQL INT 칸의 최댓값. 이보다 큰 id는 존재할 수 없다.
const MAX_INT = 2_147_483_647;

// label: 에러 메시지에 들어갈 이름 (예: "노트" → "노트 id는 1 이상의 정수여야 합니다.")
export function idSchema(label: string) {
  const message = `${label} id는 1 이상의 정수여야 합니다.`;
  return z
    .string()
    .regex(/^[1-9]\d*$/, message)
    .transform(Number)
    .refine((id) => id <= MAX_INT, message);
}
