import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const alerts: { type: string; partnerId: string; message: string }[] = [];

  // 1. 在庫アラート: stock <= 5 のロット
  const { data: lowStockLots } = await supabase
    .from("lots")
    .select("id, lot_number, stock, selling_unit, products!inner(name, partner_id)")
    .eq("status", "販売中")
    .lte("stock", 5);

  for (const lot of lowStockLots ?? []) {
    const product = lot.products as unknown as { name: string; partner_id: string };
    if (product.partner_id) {
      // 通知を作成
      const { data: members } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("partner_id", product.partner_id);

      for (const member of members ?? []) {
        await supabase.from("notifications").upsert(
          {
            user_id: member.id,
            title: "在庫アラート",
            body: `${product.name}（${lot.lot_number}）の在庫が残り${lot.stock}${lot.selling_unit ?? "個"}です`,
            link: `/partner/lots/${lot.id}`,
            entity_type: "lot",
            entity_id: lot.id,
          },
          { onConflict: "user_id,entity_type,entity_id" }
        );
        alerts.push({ type: "low_stock", partnerId: product.partner_id, message: `${product.name}: 残り${lot.stock}` });
      }
    }
  }

  // 2. 未対応引合いリマインダー: 24時間以上未対応
  const oneDayAgo = new Date(Date.now() - 24 * 3600000).toISOString();
  const { data: staleInquiries } = await supabase
    .from("agent_inquiries")
    .select("id, partner_id, products(name)")
    .eq("partner_status", "新規")
    .lte("created_at", oneDayAgo);

  for (const inq of staleInquiries ?? []) {
    const product = inq.products as unknown as { name: string } | null;
    if (inq.partner_id) {
      const { data: members } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("partner_id", inq.partner_id);

      for (const member of members ?? []) {
        await supabase.from("notifications").upsert(
          {
            user_id: member.id,
            title: "引合い未対応リマインダー",
            body: `${product?.name ?? "商品"}への引合いが24時間以上未対応です`,
            link: `/partner/inquiries/${inq.id}`,
            entity_type: "inquiry",
            entity_id: inq.id,
          },
          { onConflict: "user_id,entity_type,entity_id" }
        );
        alerts.push({ type: "stale_inquiry", partnerId: inq.partner_id, message: `引合い未対応: ${product?.name}` });
      }
    }
  }

  // 3. 賞味期限アラート: 14日以内
  const twoWeeksLater = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const { data: expiringLots } = await supabase
    .from("lots")
    .select("id, lot_number, expiration_date, products!inner(name, partner_id)")
    .eq("status", "販売中")
    .not("expiration_date", "is", null)
    .lte("expiration_date", twoWeeksLater);

  for (const lot of expiringLots ?? []) {
    const product = lot.products as unknown as { name: string; partner_id: string };
    if (product.partner_id) {
      const { data: members } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("partner_id", product.partner_id);

      for (const member of members ?? []) {
        await supabase.from("notifications").upsert(
          {
            user_id: member.id,
            title: "賞味期限アラート",
            body: `${product.name}（${lot.lot_number}）の賞味期限が${lot.expiration_date}です`,
            link: `/partner/lots/${lot.id}`,
            entity_type: "lot_expiry",
            entity_id: lot.id,
          },
          { onConflict: "user_id,entity_type,entity_id" }
        );
        alerts.push({ type: "expiring", partnerId: product.partner_id, message: `期限: ${lot.expiration_date}` });
      }
    }
  }

  return NextResponse.json({
    lowStock: lowStockLots?.length ?? 0,
    staleInquiries: staleInquiries?.length ?? 0,
    expiringLots: expiringLots?.length ?? 0,
    totalAlerts: alerts.length,
    timestamp: new Date().toISOString(),
  });
}
