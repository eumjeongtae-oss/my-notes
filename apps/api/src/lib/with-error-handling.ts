// 모든 API(route.ts)를 감싸서 "예상하지 못한 에러"를 공통으로 처리한다.
//
//   export const GET = withErrorHandling(async (request) => { ... });
//
// - 에러가 나면 서버 터미널에는 진짜 원인을 자세히 남긴다 (개발자가 보는 곳)
// - 응답에는 안전한 문구만 { message } 형식으로 보낸다 (외부에 보이는 곳)
//   DB 에러 메시지에는 DB 주소, 테이블 이름, SQL이 들어 있을 수 있어서 그대로 내보내면 안 된다
//
// 400, 404처럼 "예상한" 에러는 이 함수가 아니라 각 API가 직접 응답한다.

type RouteHandler<Context> = (
  request: Request,
  context: Context,
) => Promise<Response>;

export function withErrorHandling<Context>(
  handler: RouteHandler<Context>,
): RouteHandler<Context> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const { pathname, search } = new URL(request.url);
      console.error(`[API 에러] ${request.method} ${pathname}${search}`, error);

      return Response.json(
        { message: "서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요." },
        { status: 500 },
      );
    }
  };
}
