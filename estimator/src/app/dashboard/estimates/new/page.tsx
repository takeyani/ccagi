import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewEstimateWizard } from "@/components/estimates/NewEstimateWizard";

export default async function NewEstimatePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customers } = await supabase
    .from("estimator_customers")
    .select("id, company_name, contact_name")
    .eq("user_id", user!.id)
    .order("company_name");

  const { data: settings } = await supabase
    .from("estimator_company_settings")
    .select("default_unit_price, default_discount_rate")
    .eq("user_id", user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規見積もり作成</h1>
      <NewEstimateWizard
        customers={customers ?? []}
        defaultUnitPrice={settings?.default_unit_price ?? 700000}
        defaultDiscountRate={settings?.default_discount_rate ?? 30.0}
      />
    </div>
  );
}
