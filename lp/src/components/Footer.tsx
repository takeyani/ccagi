import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-5xl px-6 text-center text-sm text-gray-500">
        <p className="text-xs text-amber-600 font-medium mb-2">本サービスは実証実験中です。決済はテストモードで動作しています。</p>
        <p>&copy; {new Date().getFullYear()} Cross Infinity Inc. All rights reserved.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-6">
          <Link href="/legal" className="transition hover:text-gray-700">特定商取引法に基づく表記</Link>
          <Link href="/legal/seller-terms" className="transition hover:text-gray-700">出店規約</Link>
          <Link href="/privacy" className="transition hover:text-gray-700">プライバシーポリシー</Link>
          <Link href="/request" className="transition hover:text-gray-700">制作リクエスト</Link>
          <Link href="/affiliate" className="transition hover:text-gray-700">アフィリエイト</Link>
          <Link href="/guide/start" className="transition hover:text-gray-700">はじめてガイド</Link>
          <Link href="/guide/referral" className="transition hover:text-gray-700">紹介ガイド</Link>
          <Link href="/t" className="transition hover:text-gray-700">タグで探す</Link>
        </div>
      </div>
    </footer>
  );
}
