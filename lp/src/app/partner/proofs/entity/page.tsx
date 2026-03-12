import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";
import { submitEntityProof } from "./actions";

export default async function PartnerEntityProofsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: proofs } = await supabase
    .from("entity_proofs")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href="/partner/proofs" className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-block">← 証明チェーンに戻る</Link>
      <h1 className="text-2xl font-bold mb-2">主体証明</h1>
      <p className="text-sm text-gray-500 mb-6">
        生産者署名・代理店署名・販売権証明を提出してください
      </p>

      {/* Existing proofs */}
      <div className="space-y-3 mb-8">
        {proofs?.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{p.proof_type}</h3>
              <ProofStatusBadge status={p.status} />
            </div>
            <p className="text-sm text-gray-500">
              発行者: {p.issuer ?? "-"} | 発行日:{" "}
              {p.issued_at
                ? new Date(p.issued_at).toLocaleDateString("ja-JP")
                : "-"}
            </p>
            {p.expires_at && (
              <p className="text-xs text-gray-400 mt-1">
                有効期限:{" "}
                {new Date(p.expires_at).toLocaleDateString("ja-JP")}
              </p>
            )}
            {p.signature_hash && (
              <p className="text-xs text-gray-400 mt-1 font-mono">
                署名: {p.signature_hash.slice(0, 24)}...
              </p>
            )}
            {p.document_url && (
              <a
                href={p.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
              >
                書類を確認
              </a>
            )}
          </div>
        ))}
        {!proofs?.length && (
          <p className="text-gray-400">提出済みの主体証明はありません</p>
        )}
      </div>

      {/* Submit new proof */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <h2 className="font-semibold mb-4">新規証明を提出</h2>
        <form action={submitEntityProof} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                証明種別 *
              </label>
              <select
                name="proof_type"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="生産者署名">生産者署名</option>
                <option value="代理店署名">代理店署名</option>
                <option value="販売権証明">販売権証明</option>
                <option value="事業許可証">事業許可証</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                発行者
              </label>
              <input
                name="issuer"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="発行機関名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                発行日
              </label>
              <input
                name="issued_at"
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                有効期限
              </label>
              <input
                name="expires_at"
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
