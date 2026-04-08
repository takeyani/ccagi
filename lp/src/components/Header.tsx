import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/logo.png" alt="Cross Infinity" width={36} height={36} className="bg-white rounded-lg p-0.5" />
          <span className="text-lg font-bold tracking-wide">Cross Infinity</span>
        </Link>
        <nav className="flex items-center gap-3" aria-label="メインナビゲーション">
          <Link
            href="/affiliate"
            className="text-xs font-medium text-white/70 hover:text-white transition hidden sm:inline"
          >
            クリエイター / 紹介者
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white/90 hover:text-white transition"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow hover:bg-gray-100 transition"
          >
            新規登録
          </Link>
        </nav>
      </div>
    </header>
  );
}
