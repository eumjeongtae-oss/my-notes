// 요청 본문(JSON)을 읽고 zod 규칙으로 검사한다. POST, PATCH가 같이 쓴다.
//
//   const parsed = await parseBody(request, createNoteSchema);
//   if (!parsed.success) return parsed.response;   // 400 응답을 그대로 돌려준다
//   parsed.data                                    // 규칙을 통과한 값 (규칙에 없는 칸은 버려짐)
import { z } from "zod";

type ParseBodyResult<T> =
  { success: true; data: T } | { success: false; response: Response };

export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseBodyResult<T>> {
  // JSON 문법이 틀리면 request.json()에서 에러가 난다
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: Response.json(
        { message: "요청 본문이 올바른 JSON이 아닙니다." },
        { status: 400 },
      ),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      response: Response.json(
        {
          // 화면에 바로 보여줄 대표 메시지 하나
          message: result.error.issues[0].message,
          // 칸별 메시지. 화면에서 입력창 옆에 표시할 때 쓴다 → { title: ["..."] }
          fieldErrors: z.flattenError(result.error).fieldErrors,
        },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: result.data };
}
