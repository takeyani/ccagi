import Link from "next/link";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          CCAGI
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-white/90 hover:text-white transition"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow hover:bg-gray-100 transition"
          >
            新規登録
          </Link>
        </nav>
      </div>
    </header>
  );
}
