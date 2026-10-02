// 사용자 데이터 접근 (서비스). DB에서 무엇을 가져올지만 안다. HTTP는 모른다.
import "server-only";

import { prisma } from "../db";

// Google에서 받은 사용자 정보
export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
};

// ADMIN_EMAILS(쉼표로 구분)에 있는 이메일인지. 대소문자는 구분하지 않는다
function isAdminEmail(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

// Google로 로그인한 사용자를 찾고, 없으면 만든다 (처음 로그인 = 가입).
// 사용자는 이메일이 아니라 Google 고유 번호(googleId)로 찾는다.
//
//   처음 로그인 → 새로 만든다. 관리자 이메일이면 이미지 권한을 켠다
//   다시 로그인 → 이메일, 이름, 사진만 Google의 최신 값으로 고친다. 이미지 권한은 건드리지 않는다
//                 (DB에서 직접 켜거나 끈 값이 로그인할 때마다 되돌아가면 안 된다)
export async function upsertGoogleUser(profile: GoogleProfile) {
  const { googleId, email, name, picture } = profile;
  return prisma.user.upsert({
    where: { googleId },
    create: {
      googleId,
      email,
      name,
      picture,
      canUploadImages: isAdminEmail(email),
    },
    update: { email, name, picture },
    select: { id: true },
  });
}
