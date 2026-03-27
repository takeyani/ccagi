// MakeShop API連携コネクタ
// API仕様: https://www.makeshop.jp/main/api/

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

const MAKESHOP_API_BASE = "https://api.makeshop.jp/v1";

export class MakeShopConnector implements EcConnector {
  type = "makeshop";

  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    // MakeShopはAPIキー認証（shop_id + api_key）
    const { shop_id, api_key } = config.credentials;
    if (!shop_id || !api_key) return null;
    return api_key;
  }

  async fetchNewOrders(
    config: EcConnectorConfig,
    since: string | null
  ): Promise<EcOrder[]> {
    const { shop_id, api_key } = config.credentials;
    if (!shop_id || !api_key) return [];

    const sinceDate = since
      ? new Date(since)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const res = await fetch(`${MAKESHOP_API_BASE}/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${api_key}`,
          "X-Shop-Id": shop_id,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!data.orders) return [];

      return data.orders
        .filter(
          (order: Record<string, unknown>) =>
            new Date(String(order.order_date || 0)) >= sinceDate
        )
        .map(
          (order: Record<string, unknown>): EcOrder => ({
            order_id: String(order.order_id || order.id),
            order_date: order.order_date ? new Date(String(order.order_date)).toISOString() : "",
            customer_email: String(order.email || ""),
            customer_name: String(order.customer_name || ""),
            total_amount: Number(order.total_amount) || 0,
            currency: "JPY",
            status: String(order.status || "unknown"),
            items: Array.isArray(order.items)
              ? (order.items as Record<string, unknown>[]).map((item) => ({
                  product_id: String(item.product_id || ""),
                  product_name: String(item.product_name || ""),
                  quantity: Number(item.quantity) || 1,
                  unit_price: Number(item.price) || 0,
                }))
              : [],
            raw_data: order,
          })
        );
    } catch (err) {
      console.error("MakeShop order fetch error:", err);
      return [];
    }
  }

  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `makeshop_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "makeshop",
        order_id: order.order_id,
        order_date: order.order_date,
        amount: order.total_amount,
        currency: order.currency,
        status: order.status,
        items: order.items.map((i) => ({
          name: i.product_name,
          quantity: i.quantity,
          price: i.unit_price,
        })),
      },
    };
  }
}

export const makeshopConnector = new MakeShopConnector();
