import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function generateCode(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base || "ref"}-${rand}`;
}

async function lookupAffiliateId(refCode: string): Promise<string | null> {
  const { data } = await getSupabase()
    .from("affiliates")
    .select("id")
    .eq("code", refCode)
    .single();
  return data?.id ?? null;
}

export async function POST(request: Request) {
  try {
    // レート制限: 1時間あたり 10回まで（IP単位）
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`affiliate-register:${ip}`, { maxRequests: 10, windowMs: 3_600_000 });
    if (!allowed) {
      return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
    }

    const { name, email, is_creator, ref } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.length > 100) {
      return NextResponse.json(
        { error: "名前は100文字以内で入力してください" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const { data: existing } = await getSupabase()
      .from("affiliates")
      .select("code")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ code: existing.code, existing: true });
    }

    const code = generateCode(name);

    const { data, error } = await getSupabase()
      .from("affiliates")
      .insert({
        name,
        email,
        code,
        is_creator: !!is_creator,
        ...(ref ? { referred_by_affiliate_id: await lookupAffiliateId(ref) } : {}),
      })
      .select("code")
      .single();

    if (error) {
      console.error("Affiliate registration error:", error);
      return NextResponse.json(
        { error: "登録に失敗しました" },
        { status: 500 }
      );
    }

    // ステップメール登録
    try {
      const { enrollInCampaign } = await import("@/lib/step-mail");
      await enrollInCampaign({
        email,
        name,
        metadata: { affiliate_code: data.code },
        triggerEvent: "affiliate_signup",
      });
    } catch {
      // fire-and-forget
    }

    return NextResponse.json({ code: data.code, existing: false });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
