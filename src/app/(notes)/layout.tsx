import { Sidebar } from "@/components/sidebar";

// (notes) 그룹의 모든 페이지가 공유하는 레이아웃.
// 페이지를 이동해도 레이아웃은 다시 렌더링되지 않아서 사이드바 상태가 유지된다.
export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
