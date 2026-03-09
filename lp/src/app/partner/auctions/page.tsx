import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function PartnerAuctionsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: auctions } = await supabase
    .from("auctions")
    .select("*, lots!inner(lot_number, products!inner(name, partner_id))")
    .eq("lots.products.partner_id", partnerId)
    .order("created_at", { ascending: false });

  const columns = [
    {
      key: "lots",
      label: "ロット / 商品",
      render: (a: {
        lots: { lot_number: string; products: { name: string } };
      }) => `${a.lots?.products?.name} (${a.lots?.lot_number})`,
    },
    {
      key: "current_price",
      label: "現在価格",
      render: (a: { current_price: number }) =>
        `¥${a.current_price.toLocaleString()}`,
    },
    {
      key: "status",
      label: "ステータス",
      render: (a: { status: string }) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            a.status === "出品中"
              ? "bg-green-100 text-green-700"
              : a.status === "落札済み"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {a.status}
        </span>
      ),
    },
    { key: "ends_at", label: "終了日時" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">オークション</h1>
        <Link
          href="/partner/auctions/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          出品
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={auctions ?? []}
        editHref={(a) => `/partner/auctions/${a.id}`}
      />
    </div>
  );
}
