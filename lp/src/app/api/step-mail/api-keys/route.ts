import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";

export async function GET() {
  const { createSupabaseServerClient: _ssc } = await import("@/lib/supabase/server"); const _sc = await _ssc(); const { data: { user: _u } } = await _sc.auth.getUser(); if (!_u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("step_mail_api_keys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { createSupabaseServerClient: _ssc } = await import("@/lib/supabase/server"); const _sc = await _ssc(); const { data: { user: _u } } = await _sc.auth.getUser(); if (!_u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createSupabaseServerClient();
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Generate API key
  const rawKey = `sm_live_${randomBytes(24).toString("base64url")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 16);

  const { error } = await supabase.from("step_mail_api_keys").insert({
    name,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    permissions: ["events.write"],
    is_active: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ key: rawKey, prefix: keyPrefix });
}

export async function PUT(request: Request) {
  const { createSupabaseServerClient: _ssc } = await import("@/lib/supabase/server"); const _sc = await _ssc(); const { data: { user: _u } } = await _sc.auth.getUser(); if (!_u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createSupabaseServerClient();
  const { id, is_active } = await request.json();

  const { error } = await supabase
    .from("step_mail_api_keys")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
