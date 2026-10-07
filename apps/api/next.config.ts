import path from "node:path";

import type { NextConfig } from "next";

// 백엔드(API 서버) 앱. 화면(page.tsx)은 없고 src/app/api/**/route.ts만 있다.
const nextConfig: NextConfig = {
  // 배포용: 실행에 필요한 파일만 .next/standalone에 모은다 (Docker 이미지를 작게)
  output: "standalone",
  // 모노레포: pnpm은 라이브러리를 루트 node_modules에 두므로 저장소 루트부터 찾게 한다
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

export default nextConfig;
