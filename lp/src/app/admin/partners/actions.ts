"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createPartner(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("company_name") as string;
  const contactName = formData.get("contact_name") as string;
  const phone = formData.get("phone") as string;
  const postalCode = formData.get("postal_code") as string;
  const address = formData.get("address") as string;
  const partnerType = formData.get("partner_type") as string;
  const parentPartnerId = formData.get("parent_partner_id") as string;
  const paymentTerms = formData.get("payment_terms") as string;
  const memo = formData.get("memo") as string;

  // 1. Create auth user
  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) throw new Error(authError.message);

  // 2. Insert partner
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .insert({
      company_name: companyName,
      contact_name: contactName || null,
      email,
      phone: phone || null,
      postal_code: postalCode || null,
      address: address || null,
      partner_type: partnerType || "メーカー",
      parent_partner_id: parentPartnerId || null,
      payment_terms: paymentTerms || null,
      memo: memo || null,
      auth_user_id: authUser.user.id,
    })
    .select()
    .single();

  if (partnerError) throw new Error(partnerError.message);

  // 3. Insert user_profile
  const { error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      id: authUser.user.id,
      role: "partner",
      partner_id: partner.id,
      display_name: companyName,
    });

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function updatePartner(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("partners")
    .update({
      company_name: formData.get("company_name") as string,
      contact_name: (formData.get("contact_name") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      postal_code: (formData.get("postal_code") as string) || null,
      address: (formData.get("address") as string) || null,
      partner_type: (formData.get("partner_type") as string) || "メーカー",
      parent_partner_id:
        (formData.get("parent_partner_id") as string) || null,
      payment_terms: (formData.get("payment_terms") as string) || null,
      memo: (formData.get("memo") as string) || null,
      certification_status:
        (formData.get("certification_status") as string) || "未認証",
      certification_number:
        (formData.get("certification_number") as string) || null,
      certification_expiry:
        (formData.get("certification_expiry") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function addPartnerMember(partnerId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = (formData.get("display_name") as string) || email;

  // 1. Create auth user
  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) throw new Error(authError.message);

  // 2. Insert user_profile (パートナーレコードは既存を使用)
  const { error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      id: authUser.user.id,
      role: "partner",
      partner_id: partnerId,
      display_name: displayName,
    });

  if (profileError) throw new Error(profileError.message);

  revalidatePath(`/admin/partners/${partnerId}`);
}

export async function deletePartner(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}
