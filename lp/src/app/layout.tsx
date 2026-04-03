import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import AffiliateTracker from "@/components/AffiliateTracker";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "単品決済ロットLP | 初期費用0円・成果報酬型マーケットプレイス",
    template: "%s | 単品決済ロットLP",
  },
  description:
    "初期費用0円・月額0円の成果報酬型マーケットプレイス。箱単位から購入可能な商品管理・プルーフチェーン・AI検索・LP作成機能を提供します。",
  openGraph: {
    siteName: "単品決済ロットLP",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}</Script>
        </>
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <AffiliateTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
