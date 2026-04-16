import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const { createSupabaseServerClient: _ssc } = await import("@/lib/supabase/server"); const _sc = await _ssc(); const { data: { user: _u } } = await _sc.auth.getUser(); if (!_u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ec_connectors")
    .select("id, connector_type, name, is_active, last_synced_at, sync_interval_minutes, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
