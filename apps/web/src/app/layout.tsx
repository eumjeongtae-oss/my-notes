import type { Metadata } from "next";
import localFont from "next/font/local";

import { Providers } from "./_components/providers";
import "./globals.css";

// Pretendard는 Google Fonts에 없어서 npm 패키지의 폰트 파일을 직접 불러온다.
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  // 하위 페이지가 title을 정하면 "노트 제목 | 차곡" 형태가 된다.
  title: { default: "차곡", template: "%s | 차곡" },
  description: "나만 보는 마크다운 노트",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="h-full">
        {/* React Query를 앱 전체에서 쓸 수 있게 감싼다 */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
