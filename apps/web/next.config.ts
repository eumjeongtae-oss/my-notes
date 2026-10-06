import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image로 보여줄 외부 이미지 주소. 여기 없는 주소는 막힌다 (아무 사이트 이미지나 우리 서버가 대신 받아 주지 않게)
    // Google 프로필 사진 (헤더의 사용자 메뉴)
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;
