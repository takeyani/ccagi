import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";

export default async function PartnerSalesAgentPage() {
  const { partnerId, supabase } = await requirePartnerId();

  // 自社の販売中ロット
  const { data: lots } = await supabase
    .from("lots")
    .select("*, products!inner(name, partner_id)")
    .eq("products.partner_id", partnerId)
    .eq("status", "販売中")
    .order("created_at", { ascending: false });

  // 引合い（新規）
  const { data: newInquiries } = await supabase
    .from("agent_inquiries")
    .select("id, buyer_price, buyer_quantity, partner_status, products(name)")
    .eq("partner_id", partnerId)
    .eq("partner_status", "新規");

  // 過去30日の購入
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: recentPurchases } = await supabase
    .from("lot_purchases")
    .select("id, created_at, lots!inner(lot_number, price, products!inner(name, partner_id))")
    .eq("lots.products.partner_id", partnerId)
    .gte("created_at", thirtyDaysAgo);

  const activeLots = lots?.length ?? 0;
  const pendingInquiries = newInquiries?.length ?? 0;
  const recentSales = recentPurchases?.length ?? 0;

  // 在庫アラート（在庫5以下）
  const lowStockLots = (lots ?? []).filter((l: Record<string, unknown>) => (l.stock as number) <= 5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">販売エージェント</h1>
      <p className="text-sm text-gray-500 mb-6">自社商品の販売状況を自動モニタリングし、アクションを提案します</p>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{activeLots}</p>
          <p className="text-xs text-gray-500">販売中ロット</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingInquiries}</p>
          <p className="text-xs text-gray-500">未対応引合い</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{recentSales}</p>
          <p className="text-xs text-gray-500">過去30日の販売</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{lowStockLots.length}</p>
          <p className="text-xs text-gray-500">在庫アラート（5以下）</p>
        </div>
      </div>

      {/* 在庫アラート */}
      {lowStockLots.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-bold text-red-800 mb-2">在庫が少なくなっています</h2>
          <div className="space-y-2">
            {lowStockLots.map((lot: Record<string, unknown>) => {
              const product = lot.products as { name: string };
              return (
                <div key={lot.id as string} className="flex items-center justify-between text-sm">
                  <span className="text-red-700">{product.name} / {lot.lot_number as string}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-800">残り {lot.stock as number}{lot.selling_unit as string ?? "個"}</span>
                    <Link href={`/partner/lots/${lot.id}`} className="text-orange-600 hover:underline text-xs">補充</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 未対応引合い */}
      {pendingInquiries > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-amber-800">未対応の引合い</h2>
            <Link href="/partner/inquiries" className="text-orange-600 hover:underline text-xs">すべて見る</Link>
          </div>
          <div className="space-y-2">
            {(newInquiries ?? []).slice(0, 5).map((inq: Record<string, unknown>) => {
              const product = inq.products as { name: string } | null;
              return (
                <div key={inq.id as string} className="flex items-center justify-between text-sm">
                  <span className="text-amber-700">{product?.name ?? "商品"}</span>
                  <div className="flex items-center gap-3">
                    {inq.buyer_price ? <span className="text-xs text-gray-500">希望: ¥{Number(inq.buyer_price).toLocaleString()}</span> : null}
                    {inq.buyer_quantity ? <span className="text-xs text-gray-500">数量: {String(inq.buyer_quantity)}</span> : null}
                    <Link href={`/partner/inquiries/${inq.id}`} className="text-orange-600 hover:underline text-xs">対応</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 販売中ロット一覧 */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3">
          <h2 className="text-sm font-bold text-gray-700">販売中ロット</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-600">商品</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">ロット</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">在庫</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">価格</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">単位</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">賞味期限</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(lots ?? []).map((lot: Record<string, unknown>) => {
              const product = lot.products as { name: string };
              const stock = lot.stock as number;
              return (
                <tr key={lot.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-2 text-gray-600">{lot.lot_number as string}</td>
                  <td className={`px-4 py-2 text-right font-bold ${stock <= 5 ? "text-red-600" : "text-gray-900"}`}>{stock}</td>
                  <td className="px-4 py-2 text-right text-gray-900">¥{((lot.price as number) ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-gray-600">{lot.selling_unit as string ?? "個"}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{(lot.expiration_date as string) ?? "-"}</td>
                  <td className="px-4 py-2">
                    <Link href={`/partner/lots/${lot.id}`} className="text-orange-600 hover:underline text-xs">編集</Link>
                  </td>
                </tr>
              );
            })}
            {(!lots || lots.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">販売中のロットがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
