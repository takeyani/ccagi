"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  barcode: string | null;
  description: string | null;
  image_url: string | null;
  base_price: number;
  partners: { company_name: string; certification_status: string } | null;
  product_attributes: { attribute_name: string; attribute_value: string }[];
  lots: { id: string; lot_number: string; stock: number; price: number; selling_unit: string; status: string }[];
};

export default function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    // バーコード（数字のみ8-14桁）か通常検索か判定
    const isBarcode = /^\d{8,14}$/.test(query.trim());
    const param = isBarcode ? `barcode=${query.trim()}` : `q=${encodeURIComponent(query.trim())}`;

    try {
      const res = await fetch(`/api/products/search?${param}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Cross Infinity" width={48} height={48} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">商品検索</h1>
          <p className="text-sm text-gray-500 mt-1">バーコード（JAN/EAN）またはキーワードで検索</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="バーコード番号 or 商品名を入力..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium text-sm disabled:opacity-50"
          >
            {loading ? "検索中..." : "検索"}
          </button>
        </form>

        {searched && results.length === 0 && !loading && (
          <p className="text-center text-gray-400 py-8">該当する商品が見つかりませんでした</p>
        )}

        <div className="space-y-4">
          {results.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex gap-4">
                {product.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-lg border" />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
                  {product.barcode && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">JAN: {product.barcode}</p>
                  )}
                  <p className="text-orange-600 font-bold mt-1">¥{product.base_price.toLocaleString()}</p>
                  {product.partners && (
                    <p className="text-xs text-gray-500 mt-1">
                      {product.partners.company_name}
                      <span className={`ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        product.partners.certification_status === "本登録" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>{product.partners.certification_status}</span>
                    </p>
                  )}
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </div>

              {/* 成分・属性情報 */}
              {product.product_attributes.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-bold text-gray-700 mb-2">成分・属性情報</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.product_attributes.map((attr, i) => (
                      <div key={i} className="bg-gray-50 rounded px-3 py-1.5">
                        <span className="text-xs text-gray-500">{attr.attribute_name}:</span>
                        <span className="text-xs text-gray-800 ml-1 font-medium">{attr.attribute_value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 購入可能ロット */}
              {product.lots.filter(l => l.status === "販売中" && l.stock > 0).length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-bold text-gray-700 mb-2">購入可能なロット</p>
                  <div className="space-y-1">
                    {product.lots.filter(l => l.status === "販売中" && l.stock > 0).map((lot) => (
                      <Link
                        key={lot.id}
                        href={`/products/${product.slug}/${lot.id}`}
                        className="flex items-center justify-between bg-orange-50/40 rounded-lg px-3 py-2 hover:bg-orange-100/40 transition text-sm"
                      >
                        <span className="font-mono text-xs text-gray-600">{lot.lot_number}</span>
                        <span>¥{lot.price?.toLocaleString() ?? 0}/{lot.selling_unit}</span>
                        <span className="text-xs text-gray-500">在庫{lot.stock}{lot.selling_unit}</span>
                        <span className="text-orange-600 text-xs font-medium">詳細 →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">&larr; トップページに戻る</Link>
        </div>
      </div>
    </div>
  );
}
