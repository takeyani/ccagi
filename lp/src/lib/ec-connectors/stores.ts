// STORES.jp API連携コネクタ
// API仕様: https://developers.stores.jp/

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

const STORES_API = "https://api.stores.jp/v1";

export class StoresConnector implements EcConnector {
  type = "stores";

  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    const { access_token, refresh_token, client_id, client_secret } =
      config.credentials;

    if (refresh_token && client_id && client_secret) {
      try {
        const res = await fetch(`${STORES_API}/oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant_type: "refresh_token",
            client_id,
            client_secret,
            refresh_token,
          }),
        });
        const data = await res.json();
        if (data.access_token) return data.access_token;
      } catch (err) {
        console.error("STORES token refresh error:", err);
      }
    }

    return access_token || null;
  }

  async exchangeCode(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
      const res = await fetch(`${STORES_API}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });
      const data = await res.json();
      if (data.access_token) return data;
      return null;
    } catch (err) {
      console.error("STORES code exchange error:", err);
      return null;
    }
  }

  async fetchNewOrders(
    config: EcConnectorConfig,
    since: string | null
  ): Promise<EcOrder[]> {
    const accessToken = await this.authenticate(config);
    if (!accessToken) return [];

    try {
      const params = new URLSearchParams({ per_page: "100" });
      if (since) {
        params.set("created_at_from", new Date(since).toISOString());
      }

      const res = await fetch(`${STORES_API}/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!data.orders) return [];

      return data.orders.map(
        (order: Record<string, unknown>): EcOrder => ({
          order_id: String(order.id),
          order_date: order.created_at ? new Date(String(order.created_at)).toISOString() : "",
          customer_email: String(order.email || ""),
          customer_name: String(order.customer_name || ""),
          total_amount: Number(order.total_price) || 0,
          currency: "JPY",
          status: String(order.status || "unknown"),
          items: Array.isArray(order.items)
            ? (order.items as Record<string, unknown>[]).map((item) => ({
                product_id: String(item.item_id || ""),
                product_name: String(item.name || ""),
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.price) || 0,
              }))
            : [],
          raw_data: order,
        })
      );
    } catch (err) {
      console.error("STORES order fetch error:", err);
      return [];
    }
  }

  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `stores_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "stores",
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

export const storesConnector = new StoresConnector();
