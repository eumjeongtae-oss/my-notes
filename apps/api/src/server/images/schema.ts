// 이미지 API가 받는 입력의 규칙 (zod 스키마).
import { z } from "zod";

import { idSchema } from "@/lib/id-schema";

// 한 장 최대 크기: 5MB
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;

// 사람별 이미지 합계 최대: 100MB
export const IMAGE_QUOTA = 100 * 1024 * 1024;

// 받는 파일 종류와 S3에 저장할 확장자. 여기 없는 종류(svg 등)는 받지 않는다.
// svg는 그림 안에 스크립트를 넣을 수 있어서 뺀다
export const IMAGE_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
} as const;

export type ImageContentType = keyof typeof IMAGE_EXTENSIONS;

// POST /api/images 로 업로드 주소를 받을 때 보내는 값 (파일 자체가 아니라 파일 정보만)
export const createImageSchema = z.object({
  contentType: z.enum(
    Object.keys(IMAGE_EXTENSIONS) as [ImageContentType, ...ImageContentType[]],
    "PNG, JPG, GIF, WEBP 이미지만 올릴 수 있습니다.",
  ),
  size: z
    .number("파일 크기는 숫자여야 합니다.")
    .int("파일 크기는 정수여야 합니다.")
    .min(1, "빈 파일은 올릴 수 없습니다.")
    .max(IMAGE_MAX_SIZE, "이미지는 한 장에 5MB까지 올릴 수 있습니다."),
});

export type CreateImageInput = z.infer<typeof createImageSchema>;

// /api/images/:id 의 id
export const imageIdSchema = idSchema("이미지");
