import Link from "next/link";

export const metadata = { title: "ドキュメント" };

export default function DocsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            漫画ジェネレーター
          </Link>
          <span className="text-sm text-gray-500">ドキュメント</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">ドキュメント</h1>
        <Link
          href="/docs/guide"
          className="block bg-white p-6 rounded-lg border hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">おすすめ</span>
            <h2 className="text-xl font-semibold">漫画作成ガイド</h2>
          </div>
          <p className="text-gray-600 text-sm">
            初めての方はこちら。アカウント作成からキャラクター登録、トンマナ設定、漫画生成、編集、PNG/PDF出力まで。ストーリーの書き方のコツ、トンマナ組み合わせ例8パターン、FAQ付き
          </p>
        </Link>
      </main>
    </div>
  );
}
