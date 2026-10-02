// Google 로그인(OAuth)에 쓰는 arctic 설정.
// .env의 클라이언트 ID, 보안 비밀번호, 돌아올 주소로 만든다.
import "server-only";

import { Google } from "arctic";

// 받고 싶은 정보: 사용자 고유 번호(openid), 이메일, 이름과 사진(profile)
export const GOOGLE_SCOPES = ["openid", "email", "profile"];

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경 변수가 없습니다. .env를 확인하세요.`);
  }
  return value;
}

// 파일을 불러올 때가 아니라 로그인할 때 만든다.
// 빌드할 때는 .env가 없을 수 있어서, 불러오자마자 만들면 빌드가 실패한다
export function getGoogle() {
  return new Google(
    requireEnv("GOOGLE_CLIENT_ID"),
    requireEnv("GOOGLE_CLIENT_SECRET"),
    requireEnv("GOOGLE_REDIRECT_URI"),
  );
}

// 로그인이 끝나면 돌려보낼 프론트 주소
export function getWebUrl() {
  return requireEnv("WEB_URL");
}
