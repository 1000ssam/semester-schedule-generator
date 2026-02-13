import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전체 학기 시간표 생성기",
  description: "주간 시간표에서 전체 학기 시간표를 자동 생성합니다",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
