import { parseBody } from "@/lib/parse-body";
import { requireUser } from "@/lib/require-user";
import { withErrorHandling } from "@/lib/with-error-handling";
import { createImageSchema } from "@/server/images/schema";
import { createImage } from "@/server/images/service";

// POST /api/images
// 이미지 업로드를 허락하고 S3에 바로 올릴 주소를 준다. 파일이 아니라 파일 정보만 보낸다:
//   { "contentType": "image/png", "size": 204800 }
//   201: { id, upload: { url, fields } }
//        브라우저는 fields를 모두 form에 넣고 마지막에 file을 붙여 upload.url로 POST한다 (5분 안에)
//        올린 뒤 이미지는 /api/images/{id} 로 본다 (Location 헤더)
//   400: 이미지 종류가 아니거나(png, jpg, gif, webp만), 5MB를 넘음
//   401: 로그인 안 함
//   409: 이 사람의 이미지 합계가 100MB를 넘게 됨
export const POST = withErrorHandling(async (request: Request) => {
  const auth = await requireUser();
  if (!auth.success) return auth.response;

  const parsed = await parseBody(request, createImageSchema);
  if (!parsed.success) return parsed.response;

  const result = await createImage(auth.user.id, parsed.data);
  if (!result.success) {
    return Response.json(
      { message: "이미지 저장 공간(100MB)이 가득 찼습니다." },
      { status: 409 },
    );
  }

  return Response.json(
    { id: result.image.id, upload: result.upload },
    {
      status: 201,
      headers: { Location: `/api/images/${result.image.id}` },
    },
  );
});
