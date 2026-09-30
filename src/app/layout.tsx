import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Pretendard는 Google Fonts에 없어서 npm 패키지의 폰트 파일을 직접 불러온다.
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "my-notes",
  description: "나만 보는 마크다운 노트",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
