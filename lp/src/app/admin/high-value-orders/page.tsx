export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";

export default async function HighValueOrdersPage() {
  const admin = createAdminClient();

  const { data: purchases } = await admin
    .from("lot_purchases")
    .select("id, amount, status, created_at, lots(lot_number, products(name)), user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">高額注文管理</h1>
      <p className="text-sm text-gray-500 mb-6">
        ¥100,000以上の注文は手動キャプチャが必要です。
        Stripe Dashboard で確認後にキャプチャ（決済確定）してください。
      </p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">日時</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">商品</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">金額</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {(!purchases || purchases.length === 0) ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">注文データがありません</td></tr>
            ) : (
              /* eslint-disable @typescript-eslint/no-explicit-any */
              purchases.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.created_at).toLocaleString("ja-JP")}</td>
                  <td className="px-4 py-3">{p.lots?.[0]?.products?.[0]?.name ?? p.lots?.products?.name ?? "-"}</td>
                  <td className="px-4 py-3 font-medium">¥{p.amount?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      p.status === "completed" ? "bg-green-100 text-green-700" :
                      p.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-bold text-gray-800 mb-2">手動キャプチャの手順</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Stripe Dashboard → <strong>Payments</strong> を開く</li>
          <li>ステータスが「Uncaptured」の決済を確認</li>
          <li>注文内容・購入者情報を確認</li>
          <li>問題なければ「Capture」ボタンで決済確定</li>
          <li>不正が疑われる場合は「Cancel」で取消し</li>
        </ol>
        <p className="mt-2 text-xs text-gray-400">※ 7日以内にキャプチャしない場合、オーソリは自動失効します</p>
      </div>
    </div>
  );
}
