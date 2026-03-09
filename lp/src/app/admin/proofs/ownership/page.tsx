import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";

export default async function AdminOwnershipPage() {
  const supabase = await createSupabaseServerClient();
  const { data: records } = await supabase
    .from("ownership_records")
    .select("*, lots(lot_number, products(name)), partners!ownership_records_from_partner_id_fkey(company_name)")
    .order("transferred_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">所有証明</h1>
        <p className="text-sm text-gray-500 mt-1">
          決済完了と同時にデジタル上の権利を即時移転
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                移転種別
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                商品 / ロット
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                移転元
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                移転先
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                数量
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                ステータス
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                日時
              </th>
            </tr>
          </thead>
          <tbody>
            {records?.map((r) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const lot = r.lots as any;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const fromPartner = (r.partners as any)?.company_name ?? "-";
              const typeColor =
                r.transfer_type === "購入" || r.transfer_type === "落札"
                  ? "bg-green-100 text-green-700"
                  : r.transfer_type === "返品"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700";

              return (
                <tr
                  key={r.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}
                    >
                      {r.transfer_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lot?.products?.name ?? "-"}
                    <span className="text-gray-400 ml-1 text-xs">
                      ({lot?.lot_number ?? "-"})
                    </span>
                  </td>
                  <td className="px-4 py-3">{fromPartner}</td>
                  <td className="px-4 py-3">
                    {r.to_entity_name ?? r.to_entity_id}
                    <span className="text-gray-400 ml-1 text-xs">
                      ({r.to_entity_type})
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.quantity}</td>
                  <td className="px-4 py-3">
                    <ProofStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(r.transferred_at).toLocaleString("ja-JP")}
                  </td>
                </tr>
              );
            })}
            {!records?.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  所有移転記録はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
