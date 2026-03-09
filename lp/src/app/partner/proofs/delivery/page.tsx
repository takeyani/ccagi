import { requirePartnerId } from "@/lib/auth";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";
import { updatePartnerDeliveryStatus } from "./actions";

export default async function PartnerDeliveryProofsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  // Get deliveries related to this partner's ownership records
  const { data: deliveries } = await supabase
    .from("delivery_proofs")
    .select(
      "*, ownership_records!inner(from_partner_id, to_entity_name, lots(lot_number, products(name)))"
    )
    .eq("ownership_records.from_partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">配送証明</h1>
      <p className="text-sm text-gray-500 mb-6">
        自社商品の配送状況を管理
      </p>

      <div className="space-y-3">
        {deliveries?.map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ownership = d.ownership_records as any;
          const productName =
            ownership?.lots?.products?.name ?? "不明";
          const lotNumber = ownership?.lots?.lot_number ?? "-";
          const recipient = ownership?.to_entity_name ?? "-";

          const update = updatePartnerDeliveryStatus.bind(null, d.id);

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
                    送付先: {recipient}
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
                  </div>
                </div>

                {d.status === "準備中" && (
                  <form action={update} className="flex flex-col gap-2">
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
