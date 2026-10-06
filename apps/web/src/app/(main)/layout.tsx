import { redirect } from "next/navigation";

import { getCurrentUser } from "@/api/auth";

import { Header } from "./_components/header";
import { ScrollToTopButton } from "./_components/scroll-to-top-button";

// (main) 그룹의 페이지(홈, 읽기)가 공유하는 레이아웃.
// 글쓰기 화면(/write)은 헤더 없이 전체 화면을 쓰기 때문에 이 그룹 밖에 둔다.
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 헤더에 보여줄 내 정보. 쿠키는 있는데 만료된 경우(proxy.ts는 통과)에는 여기서 로그인 페이지로 보낸다
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    // relative: "맨 위로" 버튼의 감지용 칸(absolute)이 이 영역의 맨 위에 붙도록
    <div className="relative flex min-h-full flex-col">
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <ScrollToTopButton />
    </div>
  );
}
