"use client";

import { useState } from "react";
import Link from "next/link";

type ImportResult = {
  success: number;
  errors: { row: number; message: string }[];
};

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "インポートに失敗しました");
      } else {
        setResult(data);
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品CSV一括登録</h1>
        <Link href="/partner/products" className="text-sm text-orange-600 hover:underline">&larr; 商品一覧に戻る</Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
          <p className="font-bold text-gray-800">CSVフォーマット</p>
          <p>1行目はヘッダー行（必須）。以下のカラムに対応：</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">カラム名</th>
                  <th className="border px-2 py-1 text-left">必須</th>
                  <th className="border px-2 py-1 text-left">説明</th>
                  <th className="border px-2 py-1 text-left">例</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-2 py-1 font-mono">name</td><td className="border px-2 py-1 text-red-600">必須</td><td className="border px-2 py-1">商品名</td><td className="border px-2 py-1">有機玄米 5kg</td></tr>
                <tr><td className="border px-2 py-1 font-mono">slug</td><td className="border px-2 py-1 text-red-600">必須</td><td className="border px-2 py-1">URL用スラッグ（英数字-）</td><td className="border px-2 py-1">organic-rice-5kg</td></tr>
                <tr><td className="border px-2 py-1 font-mono">base_price</td><td className="border px-2 py-1 text-red-600">必須</td><td className="border px-2 py-1">税込価格（数値）</td><td className="border px-2 py-1">3500</td></tr>
                <tr><td className="border px-2 py-1 font-mono">description</td><td className="border px-2 py-1">任意</td><td className="border px-2 py-1">商品説明</td><td className="border px-2 py-1">国産有機栽培...</td></tr>
                <tr><td className="border px-2 py-1 font-mono">image_url</td><td className="border px-2 py-1">任意</td><td className="border px-2 py-1">商品画像URL</td><td className="border px-2 py-1">https://...</td></tr>
                <tr><td className="border px-2 py-1 font-mono">category</td><td className="border px-2 py-1">任意</td><td className="border px-2 py-1">カテゴリID</td><td className="border px-2 py-1">food</td></tr>
                <tr><td className="border px-2 py-1 font-mono">min_order_quantity</td><td className="border px-2 py-1">任意</td><td className="border px-2 py-1">最小注文数</td><td className="border px-2 py-1">1</td></tr>
              </tbody>
            </table>
          </div>
          <a
            href="/csv-template.csv"
            download
            className="inline-block mt-2 text-orange-600 hover:underline font-medium"
          >
            CSVテンプレートをダウンロード
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSVファイルを選択
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !file}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50"
          >
            {loading ? "インポート中..." : "CSVをインポート"}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 rounded-lg border">
            <p className="font-bold text-green-700">
              {result.success}件の商品を登録しました
            </p>
            {result.errors.length > 0 && (
              <div className="mt-3">
                <p className="font-bold text-red-600 text-sm">{result.errors.length}件のエラー:</p>
                <ul className="mt-1 text-xs text-red-600 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>行 {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
