import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSeries } from "@/api/series";
import { formatDate } from "@/lib/format";

// 브라우저 탭 제목을 묶음 이름으로 바꾼다.
export async function generateMetadata({
  params,
}: PageProps<"/series/[id]">): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeries(id);
  return { title: series?.name };
}

// 묶음 상세 (/series/2). 묶음 이름과, 속한 노트들을 1번째부터 순서대로 보여준다.
export default async function SeriesPage({
  params,
}: PageProps<"/series/[id]">) {
  const { id } = await params;
  const series = await getSeries(id);

  if (!series) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/series"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" />
        묶음 목록
      </Link>

      <p className="mt-8 text-sm font-semibold text-emerald-600">묶음</p>
      <h1 className="mt-1 text-3xl font-extrabold break-keep sm:text-4xl">
        {series.name}
      </h1>
      <p className="mt-3 text-zinc-500">노트 {series.notes.length}개</p>

      {/* ol: 순서가 있는 목록. 스크린리더도 "목록, 4개 항목 중 1번째"처럼 순서를 읽어 준다.
          빈 묶음은 서버가 지우므로 노트가 없는 경우는 따로 그리지 않는다 */}
      <ol className="mt-8 divide-y divide-zinc-100 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
        {series.notes.map((note) => (
          <li key={note.id}>
            <Link
              href={`/notes/${note.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50"
            >
              {/* 순서 번호 (1, 2, 3...) */}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                {note.seriesOrder}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold">
                {note.title}
              </span>
              <time
                dateTime={note.createdAt.toISOString()}
                className="hidden shrink-0 text-sm text-zinc-400 sm:block"
              >
                {formatDate(note.createdAt)}
              </time>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
