// Shopify API連携コネクタ
// API仕様: https://shopify.dev/docs/api/admin-rest

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

export class ShopifyConnector implements EcConnector {
  type = "shopify";

  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    const { access_token } = config.credentials;
    return access_token || null;
  }

  /**
   * Shopify OAuth認証コード→アクセストークン交換
   */
  async exchangeCode(
    shop: string,
    clientId: string,
    clientSecret: string,
    code: string
  ): Promise<{ access_token: string; scope: string } | null> {
    try {
      const res = await fetch(
        `https://${shop}/admin/oauth/access_token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        }
      );
      const data = await res.json();
      if (data.access_token) return data;
      return null;
    } catch (err) {
      console.error("Shopify code exchange error:", err);
      return null;
    }
  }

  async fetchNewOrders(
    config: EcConnectorConfig,
    since: string | null
  ): Promise<EcOrder[]> {
    const accessToken = await this.authenticate(config);
    if (!accessToken) return [];

    const shop = config.credentials.shop_domain;
    if (!shop) return [];

    const sinceDate = since
      ? new Date(since).toISOString()
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const res = await fetch(
        `https://${shop}/admin/api/2024-01/orders.json?created_at_min=${sinceDate}&status=any&limit=100`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!data.orders) return [];

      return data.orders.map(
        (order: Record<string, unknown>): EcOrder => ({
          order_id: String(order.id),
          order_date: String(order.created_at),
          customer_email: String(
            (order.customer as Record<string, unknown>)?.email ||
              order.email ||
              ""
          ),
          customer_name: [
            (order.customer as Record<string, unknown>)?.first_name,
            (order.customer as Record<string, unknown>)?.last_name,
          ]
            .filter(Boolean)
            .join(" ") || "",
          total_amount: Number(order.total_price) || 0,
          currency: String(order.currency || "JPY"),
          status: String(order.financial_status || "unknown"),
          items: Array.isArray(order.line_items)
            ? (order.line_items as Record<string, unknown>[]).map((item) => ({
                product_id: String(item.product_id || ""),
                product_name: String(item.title || ""),
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.price) || 0,
              }))
            : [],
          raw_data: order,
        })
      );
    } catch (err) {
      console.error("Shopify order fetch error:", err);
      return [];
    }
  }

  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `shopify_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "shopify",
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

export const shopifyConnector = new ShopifyConnector();
