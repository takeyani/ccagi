import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import type { Auction } from "@/lib/types";

export default async function AdminAuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("auctions")
    .select("*, lots(lot_number, products(name))")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: auctions } = await query;

  const columns = [
    {
      key: "lot_id",
      label: "ロット / 商品",
      render: (a: Record<string, unknown>) => {
        const lot = a.lots as {
          lot_number: string;
          products: { name: string } | null;
        } | null;
        return lot
          ? `${lot.products?.name ?? ""} (${lot.lot_number})`
          : "-";
      },
    },
    {
      key: "current_price",
      label: "現在価格",
      render: (a: Auction) => `¥${a.current_price.toLocaleString()}`,
    },
    {
      key: "start_price",
      label: "開始価格",
      render: (a: Auction) => `¥${a.start_price.toLocaleString()}`,
    },
    {
      key: "status",
      label: "ステータス",
      render: (a: Auction) => (
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
        <h1 className="text-2xl font-bold">オークション管理</h1>
        <div className="flex gap-2">
          {["", "出品中", "落札済み", "キャンセル"].map((s) => (
            <Link
              key={s}
              href={s ? `/admin/auctions?status=${s}` : "/admin/auctions"}
              className={`px-3 py-1 rounded-lg text-sm ${
                (status ?? "") === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s || "すべて"}
            </Link>
          ))}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={auctions ?? []}
        editHref={(a) => `/admin/auctions/${a.id}`}
      />
    </div>
  );
}
