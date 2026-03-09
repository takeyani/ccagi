import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";
import { verifyEntityProof, revokeEntityProof } from "./actions";

export default async function AdminEntityProofsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: proofs } = await supabase
    .from("entity_proofs")
    .select("*, partners(company_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">主体証明</h1>
          <p className="text-sm text-gray-500 mt-1">
            生産者・代理店の署名・販売権限を検証
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {proofs?.map((p) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const partner = (p.partners as any)?.company_name ?? "不明";
          const verify = verifyEntityProof.bind(null, p.id);
          const revoke = revokeEntityProof.bind(null, p.id);

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border shadow-sm p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{p.proof_type}</h3>
                    <ProofStatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    取引先: {partner} | 発行者: {p.issuer ?? "-"} | 発行日:{" "}
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
                      署名: {p.signature_hash.slice(0, 16)}...
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
                <div className="flex gap-2">
                  {p.status === "未検証" && (
                    <form action={verify}>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                      >
                        検証済みにする
                      </button>
                    </form>
                  )}
                  {p.status === "検証済み" && (
                    <form action={revoke}>
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        失効
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!proofs?.length && (
          <p className="text-gray-400">主体証明はまだありません</p>
        )}
      </div>
    </div>
  );
}
