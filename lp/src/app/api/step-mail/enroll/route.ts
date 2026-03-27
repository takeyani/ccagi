import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollInCampaign } from "@/lib/step-mail";
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

  try {
    const { campaign_id, email, name, metadata } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    // If campaign_id specified, enroll directly
    if (campaign_id) {
      const supabase = createAdminClient();
      const { data: campaign } = await supabase
        .from("step_mail_campaigns")
        .select("trigger_event")
        .eq("id", campaign_id)
        .eq("is_active", true)
        .single();

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found or inactive" },
          { status: 404 }
        );
      }

      const result = await enrollInCampaign({
        email,
        name,
        metadata: { ...metadata, campaign_id },
        triggerEvent: campaign.trigger_event,
      });

      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json(
      { error: "campaign_id is required" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Step mail enroll error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
