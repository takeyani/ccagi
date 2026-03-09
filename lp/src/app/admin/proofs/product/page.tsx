import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";
import { verifyProductProof, revokeProductProof } from "./actions";

export default async function AdminProductProofsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: proofs } = await supabase
    .from("product_proofs")
    .select("*, products(name, partners(company_name))")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">商品証明</h1>
        <p className="text-sm text-gray-500 mt-1">
          成分・スペック・試験成績・品質証明を検証
        </p>
      </div>

      <div className="space-y-3">
        {proofs?.map((p) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const product = p.products as any;
          const verify = verifyProductProof.bind(null, p.id);
          const revoke = revokeProductProof.bind(null, p.id);

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
                    商品: {product?.name ?? "-"} | 取引先:{" "}
                    {product?.partners?.company_name ?? "-"}
                  </p>
                  {p.lab_name && (
                    <p className="text-xs text-gray-400 mt-1">
                      検査機関: {p.lab_name}
                      {p.tested_at &&
                        ` | 検査日: ${new Date(p.tested_at).toLocaleDateString("ja-JP")}`}
                    </p>
                  )}
                  {p.valid_until && (
                    <p className="text-xs text-gray-400 mt-1">
                      有効期限:{" "}
                      {new Date(p.valid_until).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                  {p.spec_data && (
                    <details className="mt-2">
                      <summary className="text-xs text-indigo-600 cursor-pointer">
                        スペックデータを表示
                      </summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-40">
                        {JSON.stringify(p.spec_data, null, 2)}
                      </pre>
                    </details>
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
          <p className="text-gray-400">商品証明はまだありません</p>
        )}
      </div>
    </div>
  );
}
