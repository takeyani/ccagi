import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncConnector, getAvailableConnectors } from "@/lib/ec-connectors";
import type { EcConnectorConfig } from "@/lib/ec-connectors/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 汎用EC手動同期トリガー
 * POST /api/ec-connectors/[connectorType]/sync
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ connectorType: string }> }
) {
  const { connectorType } = await params;

  // コネクタの存在確認
  const available = getAvailableConnectors();
  if (!available.includes(connectorType)) {
    return NextResponse.json(
      { error: `Unknown connector type: ${connectorType}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: config } = await supabase
    .from("ec_connectors")
    .select("*")
    .eq("connector_type", connectorType)
    .eq("is_active", true)
    .single();

  if (!config) {
    return NextResponse.json(
      { error: `${connectorType} connector not configured or inactive` },
      { status: 404 }
    );
  }

  const result = await syncConnector(config as EcConnectorConfig);

  // 同期ログを保存
  await supabase.from("ec_connector_sync_logs").insert({
    connector_id: config.id,
    orders_fetched: result.orders_fetched,
    events_created: result.events_created,
    errors: result.errors,
  });

  return NextResponse.json(result);
}
