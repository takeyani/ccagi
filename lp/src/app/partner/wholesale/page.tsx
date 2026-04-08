import { requirePartnerId } from "@/lib/auth";
import Link from "next/link";

export default async function PartnerWholesalePage() {
  const { partnerId, supabase } = await requirePartnerId();

  // パートナー情報を取得して代理店か確認
  const { data: partner } = await supabase
    .from("partners")
    .select("partner_type, parent_partner_id")
    .eq("id", partnerId)
    .single();

  // 代理店の場合：親メーカーの全ロット卸価格を参照
  // メーカーの場合：自社ロットの卸価格一覧
  let lots;

  if (partner?.partner_type === "代理店" && partner.parent_partner_id) {
    // 代理店 → 親メーカーの商品ロットを参照
    const { data } = await supabase
      .from("lots")
      .select("*, products!inner(name, partner_id, base_price)")
      .eq("products.partner_id", partner.parent_partner_id)
      .eq("status", "販売中")
      .order("created_at", { ascending: false });
    lots = data;
  } else {
    // メーカー → 自社商品のロット
    const { data } = await supabase
      .from("lots")
      .select("*, products!inner(name, partner_id, base_price)")
      .eq("products.partner_id", partnerId)
      .order("created_at", { ascending: false });
    lots = data;
  }

  const isAgent = partner?.partner_type === "代理店";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        {isAgent ? "メーカー卸価格一覧" : "卸価格管理"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {isAgent
          ? "メーカーが設定した卸価格を確認できます"
          : "代理店向けの卸価格を設定・確認できます"}
      </p>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ロット番号</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">在庫</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">販売価格</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">卸価格</th>
              {!isAgent && (
                <th className="text-right px-4 py-3 font-medium text-gray-600">利益率</th>
              )}
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              {!isAgent && (
                <th className="text-center px-4 py-3 font-medium text-gray-600">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(lots ?? []).map((lot: Record<string, unknown>) => {
              const product = lot.products as { name: string; base_price: number } | null;
              const retailPrice = (lot.price as number | null) ?? product?.base_price ?? 0;
              const wholesalePrice = lot.wholesale_price as number | null;
              const margin =
                wholesalePrice && retailPrice
                  ? (((retailPrice - wholesalePrice) / retailPrice) * 100).toFixed(1)
                  : null;

              return (
                <tr key={lot.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{lot.lot_number as string}</td>
                  <td className="px-4 py-3 text-gray-700">{lot.stock as number}</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    &yen;{retailPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {wholesalePrice ? (
                      <span className="font-bold text-orange-600">
                        &yen;{wholesalePrice.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">未設定</span>
                    )}
                  </td>
                  {!isAgent && (
                    <td className="px-4 py-3 text-right text-gray-500">
                      {margin ? `${margin}%` : "-"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        lot.status === "販売中"
                          ? "bg-green-100 text-green-700"
                          : lot.status === "売切れ"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {lot.status as string}
                    </span>
                  </td>
                  {!isAgent && (
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/partner/lots/${lot.id}`}
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium hover:underline"
                      >
                        編集
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
            {(!lots || lots.length === 0) && (
              <tr>
                <td colSpan={isAgent ? 6 : 8} className="px-4 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
