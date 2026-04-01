import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: programs } = await getSupabase()
      .from("asp_programs")
      .select("id, name, description, landing_url, commission_type, commission_amount, commission_rate, asp_advertisers(name, domain)")
      .eq("status", "募集中")
      .order("created_at", { ascending: false });

    return NextResponse.json({ programs: programs ?? [] });
  } catch (err) {
    console.error("ASP programs error:", err);
    return NextResponse.json({ error: "プログラム一覧の取得に失敗しました" }, { status: 500 });
  }
}
