import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";
import { updateDeliveryStatus } from "./actions";

export default async function AdminDeliveryProofsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: deliveries } = await supabase
    .from("delivery_proofs")
    .select(
      "*, lot_purchases(lots(lot_number, products(name))), ownership_records(to_entity_name, transfer_type)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">配送証明</h1>
          <p className="text-sm text-gray-500 mt-1">
            物理的な着地をトリガーに取引を最終完了
          </p>
        </div>
        <Link
          href="/admin/proofs/delivery/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>

      <div className="space-y-3">
        {deliveries?.map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const purchase = d.lot_purchases as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ownership = d.ownership_records as any;
          const productName =
            purchase?.lots?.products?.name ?? "不明";
          const lotNumber = purchase?.lots?.lot_number ?? "-";
          const recipient = ownership?.to_entity_name ?? "-";

          const update = updateDeliveryStatus.bind(null, d.id);

          return (
            <div
              key={d.id}
              className="bg-white rounded-2xl border shadow-sm p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      {productName} ({lotNumber})
                    </h3>
                    <ProofStatusBadge status={d.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    受取人: {recipient}
                  </p>
                  <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                    {d.carrier && <p>運送業者: {d.carrier}</p>}
                    {d.tracking_number && (
                      <p>追跡番号: {d.tracking_number}</p>
                    )}
                    {d.shipped_at && (
                      <p>
                        発送日:{" "}
                        {new Date(d.shipped_at).toLocaleString("ja-JP")}
                      </p>
                    )}
                    {d.delivered_at && (
                      <p>
                        配達日:{" "}
                        {new Date(d.delivered_at).toLocaleString("ja-JP")}
                      </p>
                    )}
                    {d.received_by && <p>受領者: {d.received_by}</p>}
                  </div>
                </div>

                {d.status !== "受領確認済み" && (
                  <form action={update} className="flex flex-col gap-2">
                    {d.status === "準備中" && (
                      <>
                        <input
                          name="carrier"
                          placeholder="運送業者"
                          className="text-xs border rounded px-2 py-1"
                        />
                        <input
                          name="tracking_number"
                          placeholder="追跡番号"
                          className="text-xs border rounded px-2 py-1"
                        />
                        <input type="hidden" name="status" value="発送済み" />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          発送済みにする
                        </button>
                      </>
                    )}
                    {d.status === "発送済み" && (
                      <>
                        <input type="hidden" name="status" value="配達中" />
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
                        >
                          配達中にする
                        </button>
                      </>
                    )}
                    {d.status === "配達中" && (
                      <>
                        <input type="hidden" name="status" value="配達完了" />
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          配達完了にする
                        </button>
                      </>
                    )}
                    {d.status === "配達完了" && (
                      <>
                        <input
                          name="received_by"
                          placeholder="受領者名"
                          required
                          className="text-xs border rounded px-2 py-1"
                        />
                        <input
                          type="hidden"
                          name="status"
                          value="受領確認済み"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700"
                        >
                          受領確認（取引完了）
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>
            </div>
          );
        })}
        {!deliveries?.length && (
          <p className="text-gray-400">配送記録はありません</p>
        )}
      </div>
    </div>
  );
}
