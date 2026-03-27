import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MakerReferralsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: commissions } = await supabase
    .from("maker_referral_commissions")
    .select(`
      *,
      affiliates!inner (name, email, code),
      partners!inner (company_name),
      maker_referral_payouts (id, purchase_amount, commission_amount, status)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">メーカー紹介報酬</h1>
      <p className="text-sm text-gray-500 mb-4">
        メーカーを紹介した紹介者は、そのメーカーの売上の1%を継続的に受け取ります。
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">紹介者</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メーカー</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">報酬率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">総売上</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">総報酬</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">未払い</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {commissions?.map((commission) => {
              const affiliate = commission.affiliates as unknown as { name: string; email: string; code: string };
              const partner = commission.partners as unknown as { company_name: string };
              const payouts = (commission.maker_referral_payouts || []) as {
                id: string; purchase_amount: number; commission_amount: number; status: string;
              }[];

              const totalSales = payouts.reduce((s, p) => s + p.purchase_amount, 0);
              const totalCommission = payouts.reduce((s, p) => s + p.commission_amount, 0);
              const pending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.commission_amount, 0);

              return (
                <tr key={commission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{affiliate.name}</div>
                    <div className="text-sm text-gray-500">{affiliate.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{partner.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{(commission.commission_rate * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">&yen;{totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">&yen;{totalCommission.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">&yen;{pending.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${commission.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {commission.is_active ? "有効" : "停止"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!commissions?.length && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">メーカー紹介報酬の記録がありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
