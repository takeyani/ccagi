import { requirePartnerId } from "@/lib/auth";
import { ProofStatusBadge } from "@/components/proofs/ProofStatusBadge";

export default async function PartnerOwnershipPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: records } = await supabase
    .from("ownership_records")
    .select("*, lots(lot_number, products(name))")
    .or(`from_partner_id.eq.${partnerId},to_partner_id.eq.${partnerId}`)
    .order("transferred_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">所有権記録</h1>
        <p className="text-sm text-gray-500 mt-1">
          自社に関連する所有権移転の履歴を確認できます
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">移転種別</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品 / ロット</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">移転日時</th>
            </tr>
          </thead>
          <tbody>
            {(records ?? []).map((r: Record<string, unknown>) => {
              const lot = r.lots as { lot_number: string; products: { name: string } } | null;
              return (
                <tr key={r.id as string} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.transfer_type as string}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {lot?.products?.name ?? "-"} / {lot?.lot_number ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <ProofStatusBadge status={r.status as string} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {r.transferred_at ? new Date(r.transferred_at as string).toLocaleString("ja-JP") : "-"}
                  </td>
                </tr>
              );
            })}
            {(!records || records.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">所有権記録がありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
