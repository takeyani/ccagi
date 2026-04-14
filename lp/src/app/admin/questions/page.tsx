export const dynamic = "force-dynamic";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ServerDataTable as DataTable } from "@/components/admin/ServerDataTable";
import type { ProductQuestion } from "@/lib/types";

export default async function AdminQuestionsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: questions } = await supabase
    .from("product_questions")
    .select("*, products(name), partners(company_name)")
    .order("created_at", { ascending: false });

  type Row = ProductQuestion & {
    products: { name: string } | null;
    partners: { company_name: string } | null;
  };

  const columns = [
    {
      key: "products",
      label: "商品名",
      render: (q: Row) => q.products?.name ?? "-",
    },
    { key: "questioner_name", label: "質問者" },
    {
      key: "question",
      label: "質問",
      render: (q: Row) =>
        q.question.length > 50 ? q.question.slice(0, 50) + "..." : q.question,
    },
    {
      key: "partners",
      label: "回答者",
      render: (q: Row) => q.partners?.company_name ?? "-",
    },
    {
      key: "status",
      label: "ステータス",
      render: (q: Row) => q.status,
    },
    {
      key: "created_at",
      label: "受信日",
      render: (q: Row) =>
        new Date(q.created_at).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">商品Q&A管理</h1>
      <DataTable
        columns={columns}
        data={questions ?? []}
        editHref={(q) => `/admin/questions/${q.id}`}
      />
    </div>
  );
}
