import { NextResponse } from "next/server";
import { unsubscribe, verifyUnsubscribeToken } from "@/lib/step-mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get("id");
  const token = searchParams.get("token");

  if (!enrollmentId || !token) {
    return new Response(
      "<html><body><h1>無効なリンクです</h1></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!verifyUnsubscribeToken(enrollmentId, token)) {
    return new Response(
      "<html><body><h1>無効なリンクです</h1></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  await unsubscribe(enrollmentId);

  return new Response(
    `<html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif">
      <div style="text-align:center">
        <h1>配信停止が完了しました</h1>
        <p>今後、このキャンペーンのメールは配信されません。</p>
      </div>
    </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
