import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";

export default async function AdminProofsOverview() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: entityCount },
    { count: entityVerified },
    { count: productCount },
    { count: productVerified },
    { count: inventoryCount },
    { count: ownershipCount },
    { count: deliveryCount },
    { count: deliveryComplete },
  ] = await Promise.all([
    supabase.from("entity_proofs").select("*", { count: "exact", head: true }),
    supabase
      .from("entity_proofs")
      .select("*", { count: "exact", head: true })
      .eq("status", "検証済み"),
    supabase.from("product_proofs").select("*", { count: "exact", head: true }),
    supabase
      .from("product_proofs")
      .select("*", { count: "exact", head: true })
      .eq("status", "検証済み"),
    supabase
      .from("inventory_proofs")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("ownership_records")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("delivery_proofs")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("delivery_proofs")
      .select("*", { count: "exact", head: true })
      .eq("status", "受領確認済み"),
  ]);

  const layers = [
    {
      href: "/admin/proofs/entity",
      num: 1,
      title: "主体証明",
      desc: "「誰が」作ったか、売る権限があるか",
      stat: `${entityVerified ?? 0} / ${entityCount ?? 0} 検証済み`,
      color: "border-l-blue-500",
    },
    {
      href: "/admin/proofs/product",
      num: 2,
      title: "商品証明",
      desc: "「何が」含まれているか、品質は確かか",
      stat: `${productVerified ?? 0} / ${productCount ?? 0} 検証済み`,
      color: "border-l-purple-500",
    },
    {
      href: "/admin/proofs/inventory",
      num: 3,
      title: "在庫証明",
      desc: "「どこに」実在するか、期限はいつか",
      stat: `${inventoryCount ?? 0} 件の検証履歴`,
      color: "border-l-amber-500",
    },
    {
      href: "/admin/proofs/ownership",
      num: 4,
      title: "所有証明",
      desc: "「誰のものか」決済完了→権利即時移転",
      stat: `${ownershipCount ?? 0} 件の移転記録`,
      color: "border-l-green-500",
    },
    {
      href: "/admin/proofs/delivery",
      num: 5,
      title: "配送証明",
      desc: "「届いたか」物理着地→取引最終完了",
      stat: `${deliveryComplete ?? 0} / ${deliveryCount ?? 0} 受領確認済み`,
      color: "border-l-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">証明チェーン</h1>
      <p className="text-gray-500 mb-6">
        5層の証明で取引の信頼性を担保します
      </p>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatsCard
          label="主体証明"
          value={entityVerified ?? 0}
          sub={`/ ${entityCount ?? 0}`}
        />
        <StatsCard
          label="商品証明"
          value={productVerified ?? 0}
          sub={`/ ${productCount ?? 0}`}
        />
        <StatsCard label="在庫検証" value={inventoryCount ?? 0} />
        <StatsCard label="所有移転" value={ownershipCount ?? 0} />
        <StatsCard
          label="配送完了"
          value={deliveryComplete ?? 0}
          sub={`/ ${deliveryCount ?? 0}`}
        />
      </div>

      <div className="space-y-3">
        {layers.map((layer) => (
          <Link key={layer.num} href={layer.href} className="block">
            <div
              className={`bg-white rounded-2xl border border-l-4 ${layer.color} shadow-sm p-5 hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                    {layer.num}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{layer.title}</h3>
                    <p className="text-sm text-gray-500">{layer.desc}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{layer.stat}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
