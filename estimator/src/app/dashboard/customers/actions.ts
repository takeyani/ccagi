"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createCustomer(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("estimator_customers").insert({
    user_id: user.id,
    company_name: formData.get("company_name") as string,
    department: formData.get("department") as string,
    contact_name: formData.get("contact_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    postal_code: formData.get("postal_code") as string,
    address: formData.get("address") as string,
    memo: formData.get("memo") as string,
  });

  if (error) throw new Error(error.message);
  redirect("/dashboard/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("estimator_customers")
    .update({
      company_name: formData.get("company_name") as string,
      department: formData.get("department") as string,
      contact_name: formData.get("contact_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      postal_code: formData.get("postal_code") as string,
      address: formData.get("address") as string,
      memo: formData.get("memo") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("estimator_customers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  redirect("/dashboard/customers");
}
