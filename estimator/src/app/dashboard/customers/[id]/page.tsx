import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { updateCustomer, deleteCustomer } from "../actions";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customer } = await supabase
    .from("estimator_customers")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!customer) notFound();

  const updateWithId = updateCustomer.bind(null, id);
  const deleteWithId = deleteCustomer.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/customers"
          className="text-gray-500 hover:text-gray-700"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">顧客編集</h1>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <CustomerForm
          customer={customer}
          action={updateWithId}
          submitLabel="更新"
        />
        <div className="mt-8 pt-6 border-t">
          <form action={deleteWithId}>
            <button
              type="submit"
              className="text-red-600 hover:text-red-800 text-sm"
            >
              この顧客を削除
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
