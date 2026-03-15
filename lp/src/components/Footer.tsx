import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-5xl px-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} 単品決済ロットLP. All rights reserved.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-6">
          <a href="#" className="transition hover:text-gray-700">特定商取引法に基づく表記</a>
          <a href="#" className="transition hover:text-gray-700">プライバシーポリシー</a>
          <Link href="/request" className="transition hover:text-gray-700">制作リクエスト</Link>
          <Link href="/affiliate" className="transition hover:text-gray-700">アフィリエイト</Link>
          <Link href="/t" className="transition hover:text-gray-700">タグで探す</Link>
        </div>
      </div>
    </footer>
  );
}
