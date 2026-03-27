import { NextResponse } from "next/server";
import { processScheduledEmails, processPendingEvents } from "@/lib/step-mail";
import { syncAllConnectors } from "@/lib/ec-connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emailResult = await processScheduledEmails(50);
  const eventResult = await processPendingEvents(20);

  // EC連携コネクタの同期
  let connectorResults: unknown[] = [];
  try {
    connectorResults = await syncAllConnectors();
  } catch (err) {
    console.error("EC connector sync error:", err);
  }

  return NextResponse.json({
    emails: emailResult,
    events: eventResult,
    connectors: connectorResults,
    timestamp: new Date().toISOString(),
  });
}
