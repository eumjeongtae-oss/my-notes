// GET /api/health
// 서버가 살아 있는지 확인하는 API (헬스체크).
// 배포 환경에서 로드밸런서나 모니터링 도구가 주기적으로 호출해서 서버 상태를 확인한다.
export function GET() {
  return Response.json({ status: "ok" });
}
