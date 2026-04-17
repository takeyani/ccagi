import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * GET /api/products/search?barcode=4901234567890
 * GET /api/products/search?q=有機玄米
 *
 * バーコードまたはキーワードで商品を検索
 * 成分情報（product_attributes）も含めて返す
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode");
  const keyword = searchParams.get("q");

  if (!barcode && !keyword) {
    return NextResponse.json({ error: "barcode または q パラメータが必要です" }, { status: 400 });
  }

  const admin = createAdminClient();

  let query = admin
    .from("products")
    .select(`
      id, name, slug, barcode, description, image_url, base_price, is_active,
      category_template_id, custom_fields,
      partners:partner_id (company_name, certification_status),
      product_attributes (attribute_name, attribute_value),
      lots (id, lot_number, stock, price, selling_unit, status, expiration_date)
    `)
    .eq("is_active", true);

  if (barcode) {
    query = query.eq("barcode", barcode);
  } else if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%,barcode.eq.${keyword}`);
  }

  const { data, error } = await query.limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    results: data ?? [],
    count: data?.length ?? 0,
    query: barcode ? { type: "barcode", value: barcode } : { type: "keyword", value: keyword },
  });
}
