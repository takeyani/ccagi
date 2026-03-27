import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: campaigns, error } = await supabase
    .from("step_mail_campaigns")
    .select(`
      *,
      step_mail_steps (id),
      step_mail_enrollments (id, status)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await request.json();

  const { name, description, trigger_event, trigger_conditions, is_active, steps } = body;

  const { data: campaign, error } = await supabase
    .from("step_mail_campaigns")
    .insert({
      name,
      description,
      trigger_event,
      trigger_conditions: trigger_conditions ?? {},
      is_active: is_active ?? false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert steps if provided
  if (steps?.length) {
    const stepRows = steps.map((s: { step_number: number; delay_hours: number; subject: string; body_html: string; body_text?: string }, i: number) => ({
      campaign_id: campaign!.id,
      step_number: s.step_number ?? i + 1,
      delay_hours: s.delay_hours ?? 0,
      subject: s.subject,
      body_html: s.body_html,
      body_text: s.body_text ?? null,
    }));

    await supabase.from("step_mail_steps").insert(stepRows);
  }

  return NextResponse.json({ id: campaign!.id });
}
