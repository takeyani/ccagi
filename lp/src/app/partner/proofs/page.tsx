import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { ProofChainCard } from "@/components/proofs/ProofChainCard";

export default async function PartnerProofsOverview() {
  const { partnerId, supabase } = await requirePartnerId();

  // Aggregate proof status
  const [
    { data: entityProofs },
    { data: productProofs },
    { data: inventoryProofs },
    { data: ownerships },
    { data: deliveries },
  ] = await Promise.all([
    supabase
      .from("entity_proofs")
      .select("status")
      .eq("partner_id", partnerId),
    supabase
      .from("product_proofs")
      .select("status, products!inner(partner_id)")
      .eq("products.partner_id", partnerId),
    supabase
      .from("inventory_proofs")
      .select("id, lots!inner(products!inner(partner_id))")
      .eq("lots.products.partner_id", partnerId),
    supabase
      .from("ownership_records")
      .select("status")
      .eq("from_partner_id", partnerId),
    supabase
      .from("delivery_proofs")
      .select("status, ownership_records!inner(from_partner_id)")
      .eq("ownership_records.from_partner_id", partnerId),
  ]);

  const hasVerifiedEntity = entityProofs?.some((p) => p.status === "検証済み");
  const hasVerifiedProduct = productProofs?.some(
    (p) => p.status === "検証済み"
  );
  const hasInventory = (inventoryProofs?.length ?? 0) > 0;
  const hasOwnership = (ownerships?.length ?? 0) > 0;
  const hasDelivered = deliveries?.some(
    (d) => d.status === "受領確認済み"
  );

  const chain = {
    entity: hasVerifiedEntity
      ? ("verified" as const)
      : (entityProofs?.length ?? 0) > 0
        ? ("pending" as const)
        : ("none" as const),
    product: hasVerifiedProduct
      ? ("verified" as const)
      : (productProofs?.length ?? 0) > 0
        ? ("pending" as const)
        : ("none" as const),
    inventory: hasInventory
      ? ("verified" as const)
      : ("none" as const),
    ownership: hasOwnership
      ? ("confirmed" as const)
      : ("none" as const),
    delivery: hasDelivered
      ? ("received" as const)
      : deliveries?.some((d) => d.status === "配達完了")
        ? ("delivered" as const)
        : deliveries?.some(
              (d) => d.status === "発送済み" || d.status === "配達中"
            )
          ? ("shipped" as const)
          : ("none" as const),
  };

  const layers = [
    {
      href: "/partner/proofs/entity",
      num: 1,
      title: "主体証明",
      desc: "生産者署名・販売権証明を提出",
      count: entityProofs?.length ?? 0,
      verified: entityProofs?.filter((p) => p.status === "検証済み").length ?? 0,
      color: "border-l-blue-500",
    },
    {
      href: "/partner/proofs/product",
      num: 2,
      title: "商品証明",
      desc: "成分表・試験成績書・品質証明を提出",
      count: productProofs?.length ?? 0,
      verified:
        productProofs?.filter((p) => p.status === "検証済み").length ?? 0,
      color: "border-l-purple-500",
    },
    {
      href: "/partner/proofs/inventory",
      num: 3,
      title: "在庫証明",
      desc: "倉庫情報の登録・在庫検証を実施",
      count: inventoryProofs?.length ?? 0,
      verified: inventoryProofs?.length ?? 0,
      color: "border-l-amber-500",
    },
    {
      href: "/partner/proofs/delivery",
      num: 4,
      title: "配送証明",
      desc: "発送・配達状況を更新",
      count: deliveries?.length ?? 0,
      verified:
        deliveries?.filter((d) => d.status === "受領確認済み").length ?? 0,
      color: "border-l-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">証明チェーン</h1>
      <p className="text-gray-500 mb-6">
        自社の証明状況を確認・管理できます
      </p>

      <div className="mb-8">
        <ProofChainCard chain={chain} />
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
                    <h3 className="font-semibold">{layer.title}</h3>
                    <p className="text-sm text-gray-500">{layer.desc}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {layer.verified} / {layer.count} 完了
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
