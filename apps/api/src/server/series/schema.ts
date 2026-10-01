// 묶음 API가 받는 입력의 규칙 (zod 스키마). 화면에서는 "묶음", 코드에서는 series.
import { idSchema } from "@/lib/id-schema";

// URL의 묶음 id (/api/series/:id)
export const seriesIdSchema = idSchema("묶음");
