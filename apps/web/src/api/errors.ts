// 백엔드가 에러로 응답했을 때(4xx, 5xx) 던지는 에러. 서버용, 브라우저용 호출 함수가 같이 쓴다.
// 백엔드의 에러 응답 형식: { message: "..." }
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// 응답이 실패(4xx, 5xx)면 ApiError를 던진다. 서버용(server.ts), 브라우저용(browser.ts)이 같이 쓴다.
// 에러 응답에 본문이 없거나 JSON이 아니면(프록시 에러 페이지 등) 상태 코드로 문구를 만든다
export async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;

  const body = await response.json().catch(() => null);
  throw new ApiError(
    response.status,
    body?.message ?? `API 요청 실패 (${response.status})`,
  );
}

// 실패 문구로 보여줄 글자. 저장, 삭제 버튼 옆의 빨간 글씨에 쓴다.
// - fetch 자체가 실패(백엔드 꺼짐, 네트워크 끊김)하면 TypeError가 나고, 그 메시지는 "Failed to fetch" 같은 영어다
// - 백엔드가 에러로 응답하면 ApiError의 message(예: "제목을 입력해 주세요.")를 그대로 보여준다
export function getErrorMessage(error: Error): string {
  return error instanceof TypeError
    ? "서버에 연결하지 못했어요."
    : error.message;
}
