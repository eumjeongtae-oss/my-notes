// S3(이미지 보관함)와 대화하는 코드. 파일을 서버가 직접 주고받지 않고,
// 브라우저가 S3와 바로 주고받을 수 있는 "잠깐만 쓸 수 있는 주소(Presigned URL)"를 만들어 준다.
//
// S3를 쓸 권한(서명할 열쇠)은 SDK가 알아서 찾는다:
//   - 내 컴퓨터: apps/api/.env의 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (개발 버킷만 되는 IAM 사용자)
//   - 운영 서버: EC2에 달아 둔 IAM 역할 (서버에 저장된 키 없음)
import "server-only";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { IMAGE_MAX_SIZE, type ImageContentType } from "./schema";

// 업로드 주소와 보기 주소가 살아 있는 시간(초). 짧을수록 주소가 새어 나가도 안전하다
const UPLOAD_EXPIRES_SECONDS = 5 * 60;
const VIEW_EXPIRES_SECONDS = 5 * 60;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name}이(가) 설정되지 않았습니다. .env를 확인하세요.`);
  }
  return value;
}

// 처음 쓸 때 한 번만 만든다 (빌드 중에는 환경 변수가 없어서 파일을 불러올 때 만들면 안 된다)
let client: S3Client | undefined;
function getClient() {
  client ??= new S3Client({ region: requireEnv("AWS_REGION") });
  return client;
}

function getBucket() {
  return requireEnv("S3_IMAGES_BUCKET");
}

// 업로드용 주소와 함께 보낼 값(fields). 브라우저는 이걸로 S3에 POST(form) 요청을 보낸다.
// 조건(Conditions)에 크기와 종류를 넣어 두면, 브라우저가 약속과 다른 파일을 보내도 S3가 거절한다
// (POST /api/images에서 5MB라고 해 놓고 50MB를 보내는 것을 막는다)
export async function createUploadPost(
  key: string,
  contentType: ImageContentType,
) {
  return createPresignedPost(getClient(), {
    Bucket: getBucket(),
    Key: key,
    Fields: { "Content-Type": contentType },
    Conditions: [
      ["content-length-range", 1, IMAGE_MAX_SIZE],
      ["eq", "$Content-Type", contentType],
    ],
    Expires: UPLOAD_EXPIRES_SECONDS,
  });
}

// 보기용 주소. 이미지는 비공개라 S3 주소를 그대로 열 수 없고, 서명이 붙은 이 주소로만 잠깐 열린다
export async function createViewUrl(key: string) {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn: VIEW_EXPIRES_SECONDS },
  );
}
