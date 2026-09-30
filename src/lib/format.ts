// timeZone을 지정하지 않으면 코드가 실행되는 컴퓨터의 시간대를 따른다.
// 서버(EC2)는 보통 UTC라서 한국 시간과 9시간 차이가 나고, 날짜가 하루 밀려 보일 수 있다.
const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

// 예: 2026년 9월 30일
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}
