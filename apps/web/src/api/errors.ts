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
