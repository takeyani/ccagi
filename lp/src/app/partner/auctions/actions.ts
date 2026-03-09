"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createPartnerAuction(formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const lotId = formData.get("lot_id") as string;

  // Verify lot belongs to partner's product
  const { data: lot } = await supabase
    .from("lots")
    .select("id, products!inner(partner_id)")
    .eq("id", lotId)
    .eq("products.partner_id", partnerId)
    .single();

  if (!lot) throw new Error("指定されたロットは自社ロットではありません");

  const { data: auction, error } = await supabase
    .from("auctions")
    .insert({
      lot_id: lotId,
      start_price: Number(formData.get("start_price")),
      buy_now_price: formData.get("buy_now_price")
        ? Number(formData.get("buy_now_price"))
        : null,
      min_bid_increment: Number(formData.get("min_bid_increment") || 100),
      current_price: Number(formData.get("start_price")),
      status: "出品中",
      ends_at: formData.get("ends_at") as string,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // 自動入札トリガー（fire-and-forget）
  if (auction) {
    const admin = createAdminClient();
    admin.rpc("auto_bid_for_auction", { p_auction_id: auction.id }).then(
      ({ error: rpcErr }) => {
        if (rpcErr) console.error("auto_bid_for_auction error:", rpcErr);
      }
    );
  }

  revalidatePath("/partner/auctions");
  redirect("/partner/auctions");
}
