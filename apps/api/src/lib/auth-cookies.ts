// 로그인에 쓰는 쿠키 읽기, 쓰기, 지우기. 쿠키는 HTTP 일이라 src/server가 아니라 여기 둔다.
// Route Handler 안에서만 부른다 (Next.js의 cookies()로 쿠키를 쓸 수 있는 곳).
import { cookies } from "next/headers";

// 로그인 세션 토큰을 담는 쿠키
export const SESSION_COOKIE = "session";
// Google 로그인 중에 잠깐(10분) 쓰는 쿠키. 로그인 시작 때 만들고, 콜백에서 확인한 뒤 지운다
export const OAUTH_STATE_COOKIE = "google_oauth_state";
export const OAUTH_CODE_VERIFIER_COOKIE = "google_code_verifier";

// 모든 로그인 쿠키에 붙이는 설정
//   httpOnly: 자바스크립트(document.cookie)로 읽을 수 없다. 화면에 악성 스크립트가 끼어들어도 토큰을 못 훔친다
//   secure: HTTPS일 때만 보낸다. 로컬(http)에서는 켜면 쿠키가 안 보내지므로 배포 환경에서만 켠다
//   sameSite lax: 다른 사이트에서 시작한 요청(이미지, form 전송 등)에는 쿠키를 붙이지 않는다 (CSRF 방어)
//                 단, 링크를 눌러 이동하는 건 허용한다. Google에서 콜백으로 돌아올 때 쿠키가 있어야 해서 strict는 안 된다
//   path /: 사이트의 모든 주소에서 쓴다
const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

// 쿠키 지우기: 같은 이름, 같은 설정에 maxAge 0(지금 바로 만료)을 보내면 브라우저가 지운다.
// path 같은 설정이 다르면 브라우저는 다른 쿠키로 봐서 안 지워지므로 baseOptions를 똑같이 붙인다
function expireCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  name: string,
) {
  cookieStore.set(name, "", { ...baseOptions, maxAge: 0 });
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    ...baseOptions,
    expires: expiresAt,
  });
}

export async function deleteSessionCookie() {
  expireCookie(await cookies(), SESSION_COOKIE);
}

// Google 로그인 시작 때: state와 codeVerifier를 10분짜리 쿠키에 보관한다
export async function setOAuthCookies(state: string, codeVerifier: string) {
  const cookieStore = await cookies();
  const options = { ...baseOptions, maxAge: 60 * 10 };
  cookieStore.set(OAUTH_STATE_COOKIE, state, options);
  cookieStore.set(OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, options);
}

// Google 콜백 때: 보관해 둔 값을 꺼내고 바로 지운다 (한 번만 쓰는 값)
export async function takeOAuthCookies() {
  const cookieStore = await cookies();
  const state = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(OAUTH_CODE_VERIFIER_COOKIE)?.value;
  expireCookie(cookieStore, OAUTH_STATE_COOKIE);
  expireCookie(cookieStore, OAUTH_CODE_VERIFIER_COOKIE);
  return { state, codeVerifier };
}
