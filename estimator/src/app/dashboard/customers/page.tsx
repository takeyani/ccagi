import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/dashboard/DataTable";

export default async function CustomersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customers } = await supabase
    .from("estimator_customers")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const columns = [
    { key: "company_name", label: "会社名" },
    { key: "contact_name", label: "担当者名" },
    { key: "email", label: "メール" },
    { key: "phone", label: "電話番号" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">顧客管理</h1>
        <Link
          href="/dashboard/customers/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          顧客を追加
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={customers ?? []}
        editHref={(item) => `/dashboard/customers/${item.id}`}
      />
    </div>
  );
}
