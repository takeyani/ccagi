import { requirePartnerId } from "@/lib/auth";
import type { RecurringOrder } from "@/lib/types";
import Link from "next/link";

export default async function PartnerRecurringPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: orders } = await supabase
    .from("recurring_orders")
    .select("*, products(name), lots(lot_number)")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">定期購入一覧</h1>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">顧客名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">頻度</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">次回配送日</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">累計</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(orders as (RecurringOrder & { products: { name: string }; lots: { lot_number: string } })[] | null)?.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link href={`/partner/recurring/${o.id}`} className="text-orange-600 hover:text-orange-800 hover:underline">
                    {o.products?.name ?? "-"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{o.customer_name}</td>
                <td className="px-4 py-3 text-gray-700">{o.frequency}</td>
                <td className="px-4 py-3 text-gray-700">{o.next_delivery_date}</td>
                <td className="px-4 py-3 text-gray-700">{o.total_deliveries}回</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      o.status === "有効"
                        ? "bg-green-100 text-green-800"
                        : o.status === "一時停止"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  定期購入はまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
