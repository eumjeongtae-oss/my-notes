import { Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getSeriesList } from "@/api/series";
import { formatDate } from "@/lib/format";

import { HomeTabs } from "../_components/home-tabs";

export const metadata: Metadata = { title: "묶음" };

// 묶음 목록 (/series). 화면에서는 "묶음", 코드에서는 series.
// 묶음은 많지 않아서 무한스크롤 없이 한 번에 보여준다.
export default async function SeriesListPage() {
  const seriesList = await getSeriesList();

  return (
    // 홈(목록형)과 같은 폭이라 탭을 오가도 탭 위치가 좌우로 튀지 않는다
    <div className="mx-auto max-w-3xl px-4 py-10">
      <HomeTabs active="series" />

      {seriesList.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center text-zinc-500">
          <Layers className="size-12 text-zinc-300" strokeWidth={1.5} />
          <p className="mt-6 text-lg font-bold text-zinc-900">
            아직 만든 묶음이 없어요
          </p>
          <p className="mt-2 text-sm">
            노트를 저장할 때 묶음을 만들 수 있어요.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">
            전체 묶음{" "}
            <span className="text-base font-medium text-zinc-400">
              {seriesList.length}
            </span>
          </h1>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {seriesList.map((series) => (
              <li key={series.id}>
                <Link
                  href={`/series/${series.id}`}
                  className="flex h-full flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Layers className="size-5 text-emerald-600" />
                  <h2 className="mt-3 line-clamp-2 text-lg font-bold break-keep">
                    {series.name}
                  </h2>
                  <p className="mt-auto pt-4 text-sm text-zinc-500">
                    노트 {series.noteCount}개 · {formatDate(series.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
