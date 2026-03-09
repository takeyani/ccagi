import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditEstimateForm } from "@/components/estimates/EditEstimateForm";

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: estimate } = await supabase
    .from("estimator_estimates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!estimate) notFound();

  const { data: items } = await supabase
    .from("estimator_estimate_items")
    .select("*")
    .eq("estimate_id", id)
    .order("phase_sort_order")
    .order("task_sort_order");

  const { data: customers } = await supabase
    .from("estimator_customers")
    .select("id, company_name, contact_name")
    .eq("user_id", user!.id)
    .order("company_name");

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/dashboard/estimates/${id}`}
          className="text-gray-500 hover:text-gray-700"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">見積もり編集</h1>
      </div>
      <EditEstimateForm
        estimate={estimate}
        items={items ?? []}
        customers={customers ?? []}
      />
    </div>
  );
}
