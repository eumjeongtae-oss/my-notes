// 묶음 API가 받는 입력의 규칙 (zod 스키마). 화면에서는 "묶음", 코드에서는 series.
import { z } from "zod";

import { idSchema } from "@/lib/id-schema";

// name: VARCHAR(100)
const NAME_MAX = 100;

// URL의 묶음 id (/api/series/:id)
export const seriesIdSchema = idSchema("묶음");

// POST /api/series 로 새 묶음을 만들 때 받는 값
export const createSeriesSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "묶음 이름을 입력해 주세요."
          : "묶음 이름은 글자여야 합니다.",
    })
    .trim()
    .min(1, "묶음 이름을 입력해 주세요.")
    .max(NAME_MAX, `묶음 이름은 ${NAME_MAX}자까지 쓸 수 있습니다.`),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
