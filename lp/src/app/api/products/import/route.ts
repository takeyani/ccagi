import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"(.*)"$/, "$1"));
  return lines.slice(1).map((line) => {
    const values = line.match(/(".*?"|[^,]*)/g) ?? [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").trim().replace(/^"(.*)"$/, "$1");
    });
    return row;
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(`csv-import:${ip}`, { maxRequests: 5, windowMs: 3_600_000 });
  if (!allowed) {
    return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // partner_id 取得
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("partner_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.partner_id && profile?.role !== "admin") {
    return NextResponse.json({ error: "パートナー登録が必要です" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "CSVにデータがありません" }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "一度に登録できるのは500件までです" }, { status: 400 });
  }

  const results: { success: number; errors: { row: number; message: string }[] } = {
    success: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // header + 0-indexed

    if (!row.name || !row.slug || !row.base_price) {
      results.errors.push({ row: rowNum, message: "name, slug, base_price は必須です" });
      continue;
    }

    const price = Number(row.base_price);
    if (isNaN(price) || price <= 0) {
      results.errors.push({ row: rowNum, message: "base_price は1以上の数値が必要です: " + row.base_price });
      continue;
    }
    if (price > 500_000) {
      results.errors.push({ row: rowNum, message: "base_price が上限（¥500,000）を超えています" });
      continue;
    }

    const { error } = await supabase.from("products").insert({
      partner_id: profile?.partner_id ?? null,
      name: row.name,
      slug: row.slug,
      base_price: price,
      description: row.description || null,
      image_url: row.image_url || null,
      category_template_id: row.category || null,
      min_order_quantity: row.min_order_quantity ? Number(row.min_order_quantity) : 1,
      min_order_amount: row.min_order_amount ? Number(row.min_order_amount) : null,
      order_notes: row.order_notes || null,
      is_active: true,
    });

    if (error) {
      results.errors.push({ row: rowNum, message: error.message });
    } else {
      results.success++;
    }
  }

  return NextResponse.json(results);
}
