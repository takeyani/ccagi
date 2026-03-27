import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("step_mail_campaigns")
    .select(`
      *,
      step_mail_steps (*),
      step_mail_enrollments (id, status)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const body = await request.json();

  const { name, description, trigger_event, trigger_conditions, is_active, steps } = body;

  const { error } = await supabase
    .from("step_mail_campaigns")
    .update({
      name,
      description,
      trigger_event,
      trigger_conditions: trigger_conditions ?? {},
      is_active,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Replace steps
  if (steps) {
    await supabase
      .from("step_mail_steps")
      .delete()
      .eq("campaign_id", id);

    if (steps.length) {
      const stepRows = steps.map((s: { step_number: number; delay_hours: number; subject: string; body_html: string; body_text?: string }, i: number) => ({
        campaign_id: id,
        step_number: s.step_number ?? i + 1,
        delay_hours: s.delay_hours ?? 0,
        subject: s.subject,
        body_html: s.body_html,
        body_text: s.body_text ?? null,
      }));

      await supabase.from("step_mail_steps").insert(stepRows);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("step_mail_campaigns")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
