import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return _resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@ccagi.jp";

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? "");
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  tags,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}): Promise<{ id?: string; error?: string }> {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
      replyTo,
      tags,
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@ccagi.jp>`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { id: data?.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
