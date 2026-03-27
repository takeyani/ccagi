// EC連携コネクタ統合エンジン
// ネクストエンジン、Shopify、BASE等の受注データを取得しステップメールに登録

import { createAdminClient } from "@/lib/supabase/admin";
import { enrollInCampaign } from "@/lib/step-mail";
import type { EcConnector, EcConnectorConfig, EcSyncResult } from "./types";
import { NextEngineConnector } from "./next-engine";
import { ShopifyConnector } from "./shopify";
import { BaseConnector } from "./base-ec";
import { StoresConnector } from "./stores";
import { MakeShopConnector } from "./makeshop";
import { ColorMeConnector } from "./colorme";
import { RakutenConnector } from "./rakuten";
import { YahooConnector } from "./yahoo";

// コネクタレジストリ
const connectors: Record<string, EcConnector> = {
  next_engine: new NextEngineConnector(),
  shopify: new ShopifyConnector(),
  base: new BaseConnector(),
  stores: new StoresConnector(),
  makeshop: new MakeShopConnector(),
  colorme: new ColorMeConnector(),
  rakuten: new RakutenConnector(),
  yahoo: new YahooConnector(),
};

/**
 * 登録されたコネクタ一覧
 */
export function getAvailableConnectors(): string[] {
  return Object.keys(connectors);
}

/**
 * 単一コネクタの同期実行
 */
export async function syncConnector(
  connectorConfig: EcConnectorConfig
): Promise<EcSyncResult> {
  const connector = connectors[connectorConfig.connector_type];
  const result: EcSyncResult = {
    connector_type: connectorConfig.connector_type,
    orders_fetched: 0,
    events_created: 0,
    errors: [],
    synced_at: new Date().toISOString(),
  };

  if (!connector) {
    result.errors.push(
      `Unknown connector type: ${connectorConfig.connector_type}`
    );
    return result;
  }

  if (!connectorConfig.is_active) {
    result.errors.push("Connector is inactive");
    return result;
  }

  try {
    // 新規受注を取得
    const orders = await connector.fetchNewOrders(
      connectorConfig,
      connectorConfig.last_synced_at
    );
    result.orders_fetched = orders.length;

    // 各受注をステップメールイベントに変換して登録
    for (const order of orders) {
      if (!order.customer_email) continue;

      try {
        const event = connector.mapToStepMailEvent(order);
        await enrollInCampaign({
          email: event.customer_email,
          name: event.customer_name,
          metadata: event.payload,
          triggerEvent: "external_purchase",
        });
        result.events_created++;
      } catch (err) {
        result.errors.push(
          `Order ${order.order_id}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    // last_synced_at を更新
    const supabase = createAdminClient();
    await supabase
      .from("ec_connectors")
      .update({ last_synced_at: result.synced_at })
      .eq("id", connectorConfig.id);
  } catch (err) {
    result.errors.push(
      err instanceof Error ? err.message : "Unknown sync error"
    );
  }

  return result;
}

/**
 * 全アクティブコネクタの同期実行（cron用）
 * 最大7並列で同期を実行する
 */
export async function syncAllConnectors(): Promise<EcSyncResult[]> {
  const supabase = createAdminClient();
  const { data: configs } = await supabase
    .from("ec_connectors")
    .select("*")
    .eq("is_active", true);

  if (!configs?.length) return [];

  const MAX_CONCURRENCY = 7;
  const results: EcSyncResult[] = [];

  // 最大7並列でバッチ実行
  for (let i = 0; i < configs.length; i += MAX_CONCURRENCY) {
    const batch = configs.slice(i, i + MAX_CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map((config) => syncConnector(config as EcConnectorConfig))
    );

    for (const settled of batchResults) {
      if (settled.status === "fulfilled") {
        results.push(settled.value);
      } else {
        results.push({
          connector_type: "unknown",
          orders_fetched: 0,
          events_created: 0,
          errors: [settled.reason instanceof Error ? settled.reason.message : "Unknown error"],
          synced_at: new Date().toISOString(),
        });
      }
    }
  }

  return results;
}
