import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import type { Partner } from "@/lib/types";

export default async function AdminPartnersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "company_name", label: "会社名" },
    { key: "contact_name", label: "担当者" },
    { key: "email", label: "メール" },
    { key: "partner_type", label: "種別" },
    {
      key: "certification_status",
      label: "認証",
      render: (p: Partner) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            p.certification_status === "認証済み"
              ? "bg-green-100 text-green-700"
              : p.certification_status === "期限切れ"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {p.certification_status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">取引先管理</h1>
        <Link
          href="/admin/partners/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={partners ?? []}
        editHref={(p) => `/admin/partners/${p.id}`}
      />
    </div>
  );
}
