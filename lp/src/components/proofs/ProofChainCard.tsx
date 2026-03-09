import { ProofTimeline } from "./ProofTimeline";

type ChainStatus = {
  entity: "none" | "pending" | "verified";
  product: "none" | "pending" | "verified";
  inventory: "none" | "pending" | "verified";
  ownership: "none" | "pending" | "confirmed";
  delivery: "none" | "shipped" | "delivered" | "received";
};

function toStep(
  status: string,
  label: string,
  sublabel: string
): { label: string; sublabel: string; status: "completed" | "active" | "pending" } {
  if (status === "verified" || status === "confirmed" || status === "received")
    return { label, sublabel, status: "completed" };
  if (status === "pending" || status === "shipped" || status === "delivered")
    return { label, sublabel, status: "active" };
  return { label, sublabel, status: "pending" };
}

export function ProofChainCard({ chain }: { chain: ChainStatus }) {
  const steps = [
    toStep(chain.entity, "主体証明", "誰が"),
    toStep(chain.product, "商品証明", "何が"),
    toStep(chain.inventory, "在庫証明", "どこに"),
    toStep(chain.ownership, "所有証明", "誰の"),
    toStep(chain.delivery, "配送証明", "届いたか"),
  ];

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        証明チェーン
      </h3>
      <ProofTimeline steps={steps} />
    </div>
  );
}
