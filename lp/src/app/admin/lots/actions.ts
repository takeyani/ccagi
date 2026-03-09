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
