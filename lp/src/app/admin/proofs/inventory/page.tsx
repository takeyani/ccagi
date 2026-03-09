import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminInventoryProofsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: proofs } = await supabase
    .from("inventory_proofs")
    .select(
      "*, lots(lot_number, stock, status, warehouse_code, warehouse_name, products(name)), user_profiles!inventory_proofs_verified_by_fkey(display_name)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">在庫証明</h1>
        <p className="text-sm text-gray-500 mt-1">
          倉庫実在確認・リアルタイム在庫検証の履歴
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                ロット
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                商品
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                検証在庫
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                実在庫
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                方法
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                倉庫
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                検証者
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                日時
              </th>
            </tr>
          </thead>
          <tbody>
            {proofs?.map((p) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const lot = p.lots as any;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const verifier = (p.user_profiles as any)?.display_name ?? "-";
              const match = p.verified_stock === lot?.stock;

              return (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {lot?.lot_number ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    {lot?.products?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 font-bold">{p.verified_stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        match ? "text-green-600" : "text-red-600 font-bold"
                      }
                    >
                      {lot?.stock ?? "-"}
                      {!match && " (不一致)"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100">
                      {p.verification_method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {lot?.warehouse_name ?? lot?.warehouse_code ?? "-"}
                    {p.location_detail && (
                      <span className="text-gray-400 ml-1">
                        ({p.location_detail})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{verifier}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleString("ja-JP")}
                  </td>
                </tr>
              );
            })}
            {!proofs?.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  在庫検証履歴はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
