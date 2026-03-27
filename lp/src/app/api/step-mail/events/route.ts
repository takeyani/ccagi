import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processExternalEvent } from "@/lib/step-mail";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticateApiKey(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const key = auth.slice(7);
  const keyHash = createHash("sha256").update(key).digest("hex");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("step_mail_api_keys")
    .select("id, permissions")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (data) {
    await supabase
      .from("step_mail_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  return data;
}

export async function POST(request: Request) {
  const apiKey = await authenticateApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = apiKey.permissions as string[];
  if (!permissions.includes("events.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { event_type, event_id, customer_email, customer_name, payload } =
      body;

    if (!event_type || !customer_email) {
      return NextResponse.json(
        { error: "event_type and customer_email are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: event, error } = await supabase
      .from("step_mail_events")
      .insert({
        api_key_id: apiKey.id,
        event_type,
        event_id: event_id ?? null,
        payload: {
          customer_email,
          customer_name: customer_name ?? null,
          ...(payload ?? {}),
        },
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          ok: true,
          event_id: null,
          enrollments_created: 0,
          message: "Duplicate event ignored",
        });
      }
      throw error;
    }

    // Process immediately
    const result = await processExternalEvent(event!.id);

    return NextResponse.json({
      ok: true,
      event_id: event!.id,
      enrollments_created: result?.enrolled ?? 0,
    });
  } catch (err) {
    console.error("Step mail event error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
