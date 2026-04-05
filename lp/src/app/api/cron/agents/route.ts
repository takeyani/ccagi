import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 有効な購買エージェントを取得
  const { data: agents } = await supabase
    .from("buying_agents")
    .select("id, name, owner_id, last_run_at")
    .eq("status", "有効");

  if (!agents || agents.length === 0) {
    return NextResponse.json({ message: "No active agents", results: [] });
  }

  const results: { agentId: string; name: string; matchCount: number | null; error?: string }[] = [];

  // 各エージェントを実行（最大20件/バッチ）
  for (const agent of agents.slice(0, 20)) {
    try {
      const { data: matchCount, error } = await supabase.rpc("run_buying_agent", {
        p_agent_id: agent.id,
      });

      if (error) {
        results.push({ agentId: agent.id, name: agent.name, matchCount: null, error: error.message });
      } else {
        results.push({ agentId: agent.id, name: agent.name, matchCount: matchCount as number });
      }
    } catch (err) {
      results.push({ agentId: agent.id, name: agent.name, matchCount: null, error: String(err) });
    }
  }

  return NextResponse.json({
    totalAgents: agents.length,
    executed: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
