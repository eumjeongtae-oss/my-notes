import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 배포용: 실행에 필요한 파일만 .next/standalone에 모은다 (Docker 이미지를 작게)
  output: "standalone",
  // 모노레포: pnpm은 라이브러리를 루트 node_modules에 두므로 저장소 루트부터 찾게 한다
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  images: {
    // next/image로 보여줄 외부 이미지 주소. 여기 없는 주소는 막힌다 (아무 사이트 이미지나 우리 서버가 대신 받아 주지 않게)
    // Google 프로필 사진 (헤더의 사용자 메뉴)
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;
