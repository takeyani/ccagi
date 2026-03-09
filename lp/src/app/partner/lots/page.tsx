import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function PartnerLotsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  // Get lots for products owned by this partner
  const { data: lots } = await supabase
    .from("lots")
    .select("*, products!inner(name, partner_id)")
    .eq("products.partner_id", partnerId)
    .order("created_at", { ascending: false });

  const columns = [
    { key: "lot_number", label: "ロット番号" },
    {
      key: "products",
      label: "商品",
      render: (l: { products: { name: string } }) => l.products?.name ?? "-",
    },
    { key: "stock", label: "在庫" },
    {
      key: "status",
      label: "ステータス",
      render: (l: { status: string }) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            l.status === "販売中"
              ? "bg-green-100 text-green-700"
              : l.status === "売切れ"
                ? "bg-gray-100 text-gray-600"
                : "bg-red-100 text-red-700"
          }`}
        >
          {l.status}
        </span>
      ),
    },
    {
      key: "price",
      label: "価格",
      render: (l: { price: number | null }) =>
        l.price ? `¥${l.price.toLocaleString()}` : "-",
    },
    { key: "expiration_date", label: "賞味期限" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ロット管理</h1>
        <Link
          href="/partner/lots/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={lots ?? []}
        editHref={(l) => `/partner/lots/${l.id}`}
      />
    </div>
  );
}
