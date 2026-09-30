import { Header } from "./_components/header";

// (main) 그룹의 페이지(홈, 읽기)가 공유하는 레이아웃.
// 글쓰기 화면(/write)은 헤더 없이 전체 화면을 쓰기 때문에 이 그룹 밖에 둔다.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
