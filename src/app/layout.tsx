import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전체 학기 시간표 생성기",
  description: "주간 시간표에서 전체 학기 시간표를 자동 생성합니다",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "전체 학기 시간표 생성기",
    description: "주간 시간표 입력 → 학기 전체 시간표 자동 생성",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '전체 학기 시간표 생성기',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "전체 학기 시간표 생성기",
    description: "주간 시간표 입력 → 학기 전체 시간표 자동 생성",
    images: ['/og-image.png'],
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
