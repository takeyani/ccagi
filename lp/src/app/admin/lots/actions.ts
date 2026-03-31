"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createLot(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("lots").insert({
    product_id: formData.get("product_id") as string,
    lot_number: formData.get("lot_number") as string,
    stock: Number(formData.get("stock")),
    expiration_date: (formData.get("expiration_date") as string) || null,
    status: (formData.get("status") as string) || "販売中",
    price: formData.get("price") ? Number(formData.get("price")) : null,
    purchase_date: (formData.get("purchase_date") as string) || null,
    purchase_price: formData.get("purchase_price")
      ? Number(formData.get("purchase_price"))
      : null,
    memo: (formData.get("memo") as string) || null,
    wholesale_price: formData.get("wholesale_price") ? Number(formData.get("wholesale_price")) : null,
    shipping_method: (formData.get("shipping_method") as string) || "メーカー無料",
    shipping_fee: formData.get("shipping_fee") ? Number(formData.get("shipping_fee")) : 0,
    selling_unit: (formData.get("selling_unit") as string) || "個",
    units_per_case: formData.get("units_per_case") ? Number(formData.get("units_per_case")) : null,
    cases_per_pallet: formData.get("cases_per_pallet") ? Number(formData.get("cases_per_pallet")) : null,
    min_order_units: formData.get("min_order_units") ? Number(formData.get("min_order_units")) : 1,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/lots");
  redirect("/admin/lots");
}

export async function updateLot(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("lots")
    .update({
      product_id: formData.get("product_id") as string,
      lot_number: formData.get("lot_number") as string,
      stock: Number(formData.get("stock")),
      expiration_date: (formData.get("expiration_date") as string) || null,
      status: (formData.get("status") as string) || "販売中",
      price: formData.get("price") ? Number(formData.get("price")) : null,
      purchase_date: (formData.get("purchase_date") as string) || null,
      purchase_price: formData.get("purchase_price")
        ? Number(formData.get("purchase_price"))
        : null,
      memo: (formData.get("memo") as string) || null,
      wholesale_price: formData.get("wholesale_price") ? Number(formData.get("wholesale_price")) : null,
      shipping_method: (formData.get("shipping_method") as string) || "メーカー無料",
      shipping_fee: formData.get("shipping_fee") ? Number(formData.get("shipping_fee")) : 0,
      selling_unit: (formData.get("selling_unit") as string) || "個",
      units_per_case: formData.get("units_per_case") ? Number(formData.get("units_per_case")) : null,
      cases_per_pallet: formData.get("cases_per_pallet") ? Number(formData.get("cases_per_pallet")) : null,
      min_order_units: formData.get("min_order_units") ? Number(formData.get("min_order_units")) : 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/lots");
  redirect("/admin/lots");
}

export async function deleteLot(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lots").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lots");
  redirect("/admin/lots");
}
