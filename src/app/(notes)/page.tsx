import { NotebookPen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
      <NotebookPen className="size-10" strokeWidth={1.5} />
      <p className="text-sm">왼쪽에서 노트를 선택하세요.</p>
    </div>
  );
}
