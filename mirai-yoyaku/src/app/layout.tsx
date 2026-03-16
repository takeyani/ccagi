import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "未来予約 | 大切な人へ、未来にメッセージを届ける",
  description:
    "今この瞬間の想いを、未来の大切な日に届けるビデオメッセージサービス。1日10円のデータ保管料で、あなたの想いを未来に届けます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
