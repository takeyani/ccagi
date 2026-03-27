// BASE API連携コネクタ
// API仕様: https://docs.thebase.in/

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

const BASE_API = "https://api.thebase.in/1";
const BASE_AUTH_URL = "https://api.thebase.in/1/oauth/authorize";

export class BaseConnector implements EcConnector {
  type = "base";

  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    const { client_id, client_secret, refresh_token, access_token } =
      config.credentials;

    if (refresh_token && client_id && client_secret) {
      try {
        const res = await fetch(`${BASE_API}/oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id,
            client_secret,
            refresh_token,
          }),
        });
        const data = await res.json();
        if (data.access_token) return data.access_token;
      } catch (err) {
        console.error("BASE token refresh error:", err);
      }
    }

    return access_token || null;
  }

  getAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read_orders",
    });
    return `${BASE_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
      const res = await fetch(`${BASE_API}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
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
      console.error("BASE code exchange error:", err);
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
      const params = new URLSearchParams({ limit: "100", order: "created" });
      if (since) {
        params.set("start_created", since);
      }

      const res = await fetch(`${BASE_API}/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!data.orders) return [];

      return data.orders.map(
        (order: Record<string, unknown>): EcOrder => ({
          order_id: String(order.unique_key || order.order_id),
          order_date: order.ordered ? new Date(String(order.ordered)).toISOString() : "",
          customer_email: String(
            (order.order_receiver as Record<string, unknown>)?.email || ""
          ),
          customer_name: [
            (order.order_receiver as Record<string, unknown>)?.last_name,
            (order.order_receiver as Record<string, unknown>)?.first_name,
          ]
            .filter(Boolean)
            .join("") || "",
          total_amount: Number(order.total) || 0,
          currency: "JPY",
          status: String(order.dispatch_status || "unknown"),
          items: Array.isArray(order.order_items)
            ? (order.order_items as Record<string, unknown>[]).map((item) => ({
                product_id: String(item.item_id || ""),
                product_name: String(item.item_title || ""),
                quantity: Number(item.amount) || 1,
                unit_price: Number(item.price) || 0,
              }))
            : [],
          raw_data: order,
        })
      );
    } catch (err) {
      console.error("BASE order fetch error:", err);
      return [];
    }
  }

  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `base_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "base",
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

export const baseConnector = new BaseConnector();
