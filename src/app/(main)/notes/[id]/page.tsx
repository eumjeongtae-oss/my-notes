import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownPreview } from "@/components/markdown-preview";
import { formatDate } from "@/lib/format";
import { getNote } from "@/lib/notes";

// 브라우저 탭 제목을 노트 제목으로 바꾼다.
export async function generateMetadata({
  params,
}: PageProps<"/notes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const note = await getNote(id);
  return { title: note?.title };
}

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl leading-tight font-extrabold break-keep sm:text-5xl">
        {note.title}
      </h1>

      <div className="mt-8 flex items-center justify-between text-zinc-500">
        <time dateTime={note.updatedAt.toISOString()}>
          {formatDate(note.updatedAt)}
        </time>
        <Link
          href={`/write?id=${note.id}`}
          className="text-sm hover:text-zinc-900"
        >
          수정
        </Link>
      </div>

      <hr className="mt-6 mb-12 border-zinc-100" />

      {/* prose-lg: 본문 18px, 줄 간격 약 1.8. 오래 읽는 화면이라 한 단계 크게 쓴다 */}
      <MarkdownPreview content={note.content} className="prose-lg" />
    </div>
  );
}
