// 이미지 데이터 접근 계층 (서비스). HTTP는 모른다.
//
// ⚠️ 노트와 같이 모든 함수는 userId를 받고, 조회에 userId 조건을 붙인다.
// 남의 이미지는 "없는 이미지"처럼 다룬다 (→ 404). 이미지는 올린 본인만 볼 수 있다.
import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "../db";
import { createUploadPost } from "./s3";
import { type CreateImageInput, IMAGE_EXTENSIONS, IMAGE_QUOTA } from "./schema";

// 이 사람이 지금까지 올린 이미지 크기의 합(바이트)
async function getUsedBytes(userId: number) {
  const result = await prisma.image.aggregate({
    where: { userId },
    _sum: { size: true },
  });
  return result._sum.size ?? 0;
}

// 업로드를 허락한다: 용량을 확인하고, 기록을 남기고, S3 업로드 주소를 만든다.
// 파일은 아직 올라가지 않았다. 브라우저가 돌려받은 주소로 S3에 바로 올린다
export async function createImage(userId: number, input: CreateImageInput) {
  const used = await getUsedBytes(userId);
  if (used + input.size > IMAGE_QUOTA) {
    return { success: false as const, reason: "quota" as const };
  }

  // S3 안의 위치: 사람마다 폴더를 나누고, 파일 이름은 무작위로 (원래 파일 이름은 쓰지 않는다)
  const key = `images/${userId}/${randomUUID()}.${IMAGE_EXTENSIONS[input.contentType]}`;

  const image = await prisma.image.create({
    data: {
      userId,
      key,
      contentType: input.contentType,
      size: input.size,
    },
    select: { id: true },
  });

  const upload = await createUploadPost(key, input.contentType);
  return { success: true as const, image, upload };
}

// 내 이미지 하나. 남의 것이거나 없으면 null
export async function getImage(userId: number, id: number) {
  return prisma.image.findFirst({
    where: { id, userId },
    select: { key: true },
  });
}
