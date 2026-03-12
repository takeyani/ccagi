import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";
import { submitProductProof } from "./actions";

export default async function PartnerProductProofsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const [{ data: proofs }, { data: products }] = await Promise.all([
    supabase
      .from("product_proofs")
      .select("*, products!inner(name, partner_id)")
      .eq("products.partner_id", partnerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("id, name")
      .eq("partner_id", partnerId)
      .order("name"),
  ]);

  return (
    <div>
      <Link href="/partner/proofs" className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-block">← 証明チェーンに戻る</Link>
      <h1 className="text-2xl font-bold mb-2">商品証明</h1>
      <p className="text-sm text-gray-500 mb-6">
        成分表・スペックシート・試験成績書・品質証明書を提出してください
      </p>

      {/* Existing proofs */}
      <div className="space-y-3 mb-8">
        {proofs?.map((p) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const product = (p.products as any)?.name ?? "-";
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{p.proof_type}</h3>
                <ProofStatusBadge status={p.status} />
              </div>
              <p className="text-sm text-gray-500">
                商品: {product}
                {p.lab_name && ` | 検査機関: ${p.lab_name}`}
              </p>
              {p.valid_until && (
                <p className="text-xs text-gray-400 mt-1">
                  有効期限:{" "}
                  {new Date(p.valid_until).toLocaleDateString("ja-JP")}
                </p>
              )}
              {p.spec_data && (
                <details className="mt-2">
                  <summary className="text-xs text-indigo-600 cursor-pointer">
                    スペックデータ
                  </summary>
                  <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(p.spec_data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          );
        })}
        {!proofs?.length && (
          <p className="text-gray-400">提出済みの商品証明はありません</p>
        )}
      </div>

      {/* Submit new proof */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <h2 className="font-semibold mb-4">新規商品証明を提出</h2>
        <form action={submitProductProof} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品 *
              </label>
              <select
                name="product_id"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 選択 --</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                証明種別 *
              </label>
              <select
                name="proof_type"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="成分表">成分表</option>
                <option value="スペックシート">スペックシート</option>
                <option value="試験成績書">試験成績書</option>
                <option value="品質証明書">品質証明書</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検査機関名
              </label>
              <input
                name="lab_name"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検査日
              </label>
              <input
                name="tested_at"
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                有効期限
              </label>
              <input
                name="valid_until"
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              書類URL
            </label>
            <input
              name="document_url"
              type="url"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スペックデータ（JSON）
            </label>
            <textarea
              name="spec_data"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              placeholder='例: {"成分": "ビタミンC 1000mg", "内容量": "90粒"}'
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            提出
          </button>
        </form>
      </div>
    </div>
  );
}
