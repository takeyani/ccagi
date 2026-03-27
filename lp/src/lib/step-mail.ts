import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, renderTemplate } from "@/lib/email";
import { createHmac } from "crypto";

const HMAC_SECRET = process.env.RESEND_API_KEY || "step-mail-secret";

function signToken(enrollmentId: string): string {
  return createHmac("sha256", HMAC_SECRET)
    .update(enrollmentId)
    .digest("hex");
}

export function verifyUnsubscribeToken(
  enrollmentId: string,
  token: string
): boolean {
  return signToken(enrollmentId) === token;
}

function getUnsubscribeUrl(enrollmentId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const token = signToken(enrollmentId);
  return `${baseUrl}/api/step-mail/unsubscribe?id=${enrollmentId}&token=${token}`;
}

export async function enrollInCampaign({
  email,
  name,
  metadata,
  triggerEvent,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, unknown>;
  triggerEvent: string;
}) {
  const supabase = createAdminClient();

  // Find matching active campaigns
  const { data: campaigns } = await supabase
    .from("step_mail_campaigns")
    .select("id, trigger_conditions")
    .eq("trigger_event", triggerEvent)
    .eq("is_active", true);

  if (!campaigns?.length) return { enrolled: 0 };

  let enrolled = 0;

  for (const campaign of campaigns) {
    // Check trigger_conditions match
    const conditions = campaign.trigger_conditions as Record<string, unknown>;
    if (Object.keys(conditions).length > 0 && metadata) {
      const matches = Object.entries(conditions).every(
        ([key, value]) => metadata[key] === value
      );
      if (!matches) continue;
    }

    // Insert enrollment (idempotent via unique constraint)
    const { data: enrollment, error } = await supabase
      .from("step_mail_enrollments")
      .upsert(
        {
          campaign_id: campaign.id,
          user_email: email,
          user_name: name ?? null,
          metadata: metadata ?? {},
          current_step: 0,
          status: "active",
        },
        { onConflict: "campaign_id,user_email", ignoreDuplicates: true }
      )
      .select("id")
      .single();

    if (error || !enrollment) continue;

    // Get first step
    const { data: firstStep } = await supabase
      .from("step_mail_steps")
      .select("id, delay_hours")
      .eq("campaign_id", campaign.id)
      .eq("step_number", 1)
      .single();

    if (!firstStep) continue;

    // Schedule first email
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + firstStep.delay_hours);

    await supabase.from("step_mail_logs").insert({
      enrollment_id: enrollment.id,
      step_id: firstStep.id,
      scheduled_for: scheduledFor.toISOString(),
      status: "pending",
    });

    enrolled++;
  }

  return { enrolled };
}

export async function processScheduledEmails(batchSize = 50) {
  const supabase = createAdminClient();
  let sent = 0;
  let failed = 0;

  // Atomically claim pending logs
  const { data: logs } = await supabase
    .from("step_mail_logs")
    .select(`
      id, enrollment_id, step_id,
      step_mail_enrollments!inner (
        id, user_email, user_name, metadata, campaign_id, status
      ),
      step_mail_steps!inner (
        id, step_number, subject, body_html, body_text, campaign_id
      )
    `)
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(batchSize);

  if (!logs?.length) return { sent, failed, total: 0 };

  // Mark as sending
  const logIds = logs.map((l) => l.id);
  await supabase
    .from("step_mail_logs")
    .update({ status: "sending" })
    .in("id", logIds);

  for (const log of logs) {
    const enrollment = log.step_mail_enrollments as unknown as {
      id: string;
      user_email: string;
      user_name: string | null;
      metadata: Record<string, string>;
      campaign_id: string;
      status: string;
    };
    const step = log.step_mail_steps as unknown as {
      id: string;
      step_number: number;
      subject: string;
      body_html: string;
      body_text: string | null;
      campaign_id: string;
    };

    // Skip if enrollment is no longer active
    if (enrollment.status !== "active") {
      await supabase
        .from("step_mail_logs")
        .update({ status: "failed", error_message: "Enrollment not active" })
        .eq("id", log.id);
      failed++;
      continue;
    }

    // Build template variables
    const variables: Record<string, string> = {
      user_name: enrollment.user_name || "お客様",
      user_email: enrollment.user_email,
      unsubscribe_url: getUnsubscribeUrl(enrollment.id),
      ...Object.fromEntries(
        Object.entries(enrollment.metadata).map(([k, v]) => [k, String(v)])
      ),
    };

    const subject = renderTemplate(step.subject, variables);
    const html = renderTemplate(step.body_html, variables);
    const text = step.body_text
      ? renderTemplate(step.body_text, variables)
      : undefined;

    const result = await sendEmail({
      to: enrollment.user_email,
      subject,
      html,
      text,
      tags: [
        { name: "campaign_id", value: enrollment.campaign_id },
        { name: "step_number", value: String(step.step_number) },
      ],
    });

    if (result.error) {
      await supabase
        .from("step_mail_logs")
        .update({
          status: "failed",
          error_message: result.error,
        })
        .eq("id", log.id);
      failed++;
      continue;
    }

    // Mark as sent
    await supabase
      .from("step_mail_logs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        resend_message_id: result.id ?? null,
      })
      .eq("id", log.id);

    // Advance enrollment to next step
    const nextStepNumber = step.step_number + 1;
    const { data: nextStep } = await supabase
      .from("step_mail_steps")
      .select("id, delay_hours")
      .eq("campaign_id", enrollment.campaign_id)
      .eq("step_number", nextStepNumber)
      .single();

    if (nextStep) {
      // Schedule next email
      const nextScheduledFor = new Date();
      nextScheduledFor.setHours(
        nextScheduledFor.getHours() + nextStep.delay_hours
      );

      await supabase
        .from("step_mail_enrollments")
        .update({ current_step: nextStepNumber })
        .eq("id", enrollment.id);

      await supabase.from("step_mail_logs").insert({
        enrollment_id: enrollment.id,
        step_id: nextStep.id,
        scheduled_for: nextScheduledFor.toISOString(),
        status: "pending",
      });
    } else {
      // Campaign complete
      await supabase
        .from("step_mail_enrollments")
        .update({
          current_step: step.step_number,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", enrollment.id);
    }

    sent++;
  }

  return { sent, failed, total: logs.length };
}

export async function processExternalEvent(eventId: string) {
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("step_mail_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event || event.status !== "pending") return;

  try {
    const payload = event.payload as Record<string, unknown>;
    const email = (payload.customer_email as string) || "";
    const name = (payload.customer_name as string) || undefined;

    if (!email) {
      await supabase
        .from("step_mail_events")
        .update({
          status: "failed",
          error_message: "Missing customer_email",
          processed_at: new Date().toISOString(),
        })
        .eq("id", eventId);
      return;
    }

    // Map external event_type to internal trigger
    const triggerMap: Record<string, string> = {
      purchase: "external_purchase",
      refund: "external_refund",
      signup: "external_signup",
      custom: "custom",
    };

    const triggerEvent = triggerMap[event.event_type] || "custom";
    const result = await enrollInCampaign({
      email,
      name,
      metadata: payload as Record<string, unknown>,
      triggerEvent,
    });

    await supabase
      .from("step_mail_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    return result;
  } catch (err) {
    await supabase
      .from("step_mail_events")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error",
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventId);
  }
}

export async function processPendingEvents(batchSize = 20) {
  const supabase = createAdminClient();
  let processed = 0;
  let failed = 0;

  const { data: events } = await supabase
    .from("step_mail_events")
    .select("id")
    .eq("status", "pending")
    .order("created_at")
    .limit(batchSize);

  if (!events?.length) return { processed, failed, total: 0 };

  for (const event of events) {
    try {
      await processExternalEvent(event.id);
      processed++;
    } catch {
      failed++;
    }
  }

  return { processed, failed, total: events.length };
}

export async function unsubscribe(enrollmentId: string) {
  const supabase = createAdminClient();

  // Update enrollment
  await supabase
    .from("step_mail_enrollments")
    .update({ status: "unsubscribed" })
    .eq("id", enrollmentId);

  // Delete pending logs
  await supabase
    .from("step_mail_logs")
    .delete()
    .eq("enrollment_id", enrollmentId)
    .eq("status", "pending");
}

export async function getCampaignStats(campaignId: string) {
  const supabase = createAdminClient();

  const { data: enrollments } = await supabase
    .from("step_mail_enrollments")
    .select("status")
    .eq("campaign_id", campaignId);

  const { data: logs } = await supabase
    .from("step_mail_logs")
    .select("status, step_id")
    .in(
      "enrollment_id",
      (enrollments || []).map((e: { status: string }) => e)
    );

  const total = enrollments?.length ?? 0;
  const active =
    enrollments?.filter((e: { status: string }) => e.status === "active")
      .length ?? 0;
  const completed =
    enrollments?.filter((e: { status: string }) => e.status === "completed")
      .length ?? 0;
  const unsubscribed =
    enrollments?.filter((e: { status: string }) => e.status === "unsubscribed")
      .length ?? 0;

  const totalSent =
    logs?.filter((l: { status: string }) => l.status === "sent").length ?? 0;
  const totalFailed =
    logs?.filter((l: { status: string }) => l.status === "failed").length ?? 0;

  return { total, active, completed, unsubscribed, totalSent, totalFailed };
}
