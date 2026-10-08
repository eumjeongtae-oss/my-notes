import { requireUser } from "@/lib/require-user";
import { withErrorHandling } from "@/lib/with-error-handling";
import { createViewUrl } from "@/server/images/s3";
import { imageIdSchema } from "@/server/images/schema";
import { getImage } from "@/server/images/service";

type Context = RouteContext<"/api/images/[id]">;

// GET /api/images/:id
// 내 이미지를 본다. 노트 본문의 ![](https://api.chagoknotes.com/api/images/7) 이 이 주소다.
// 이미지는 비공개 보관함에 있어서, 주인인지 확인한 뒤 S3의 "5분만 열리는 주소"로 보낸다.
//   302: S3의 서명된 주소로 이동 (브라우저가 따라가서 그림을 받는다)
//   400: id가 올바른 숫자가 아님
//   401: 로그인 안 함
//   404: 없는 이미지. 남의 이미지여도 404 (노트와 같다)
//
// <img>가 이 주소를 부를 때도 로그인 쿠키가 같이 온다
// (web과 api가 같은 사이트 chagoknotes.com이고, 쿠키 도메인을 맞춰 두었기 때문. 4-4)
export const GET = withErrorHandling(
  async (_request: Request, ctx: Context) => {
    const auth = await requireUser();
    if (!auth.success) return auth.response;

    const { id: rawId } = await ctx.params;
    const parsed = imageIdSchema.safeParse(rawId);
    if (!parsed.success) {
      return Response.json(
        { message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const image = await getImage(auth.user.id, parsed.data);
    if (!image) {
      return Response.json(
        { message: `${parsed.data}번 이미지를 찾을 수 없습니다.` },
        { status: 404 },
      );
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: await createViewUrl(image.key),
        // 이 이동을 브라우저가 4분 동안 기억한다 (S3 주소는 5분 동안 열리니 그보다 짧게).
        // 노트를 다시 열 때마다 api와 S3에 묻지 않아도 된다. private: 내 브라우저만 기억 (중간 서버는 저장 안 함)
        "Cache-Control": "private, max-age=240",
      },
    });
  },
);
