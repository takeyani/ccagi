// Yahoo!ショッピング API連携コネクタ
// API仕様: https://developer.yahoo.co.jp/webapi/shopping/

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

const YAHOO_API = "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1";
const YAHOO_AUTH_URL = "https://auth.login.yahoo.co.jp/yconnect/v2/authorization";
const YAHOO_TOKEN_URL = "https://auth.login.yahoo.co.jp/yconnect/v2/token";

export class YahooConnector implements EcConnector {
  type = "yahoo";

  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    const { client_id, client_secret, refresh_token, access_token } =
      config.credentials;

    if (refresh_token && client_id && client_secret) {
      try {
        const res = await fetch(YAHOO_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token,
          }),
        });
        const data = await res.json();
        if (data.access_token) return data.access_token;
      } catch (err) {
        console.error("Yahoo token refresh error:", err);
      }
    }

    return access_token || null;
  }

  getAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid",
    });
    return `${YAHOO_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
      const res = await fetch(YAHOO_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      const data = await res.json();
      if (data.access_token) return data;
      return null;
    } catch (err) {
      console.error("Yahoo code exchange error:", err);
      return null;
    }
  }

  async fetchNewOrders(
    config: EcConnectorConfig,
    since: string | null
  ): Promise<EcOrder[]> {
    const accessToken = await this.authenticate(config);
    if (!accessToken) return [];

    const sellerId = config.credentials.seller_id;
    if (!sellerId) return [];

    const sinceDate = since
      ? new Date(since)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const formatYahooDate = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

    try {
      const res = await fetch(
        `${YAHOO_API}/orderList?sellerId=${sellerId}&StartDate=${formatYahooDate(sinceDate)}&EndDate=${formatYahooDate(new Date())}&Result=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();
      const orders = data?.ResultSet?.Result?.OrderInfo;
      if (!orders) return [];

      const orderList = Array.isArray(orders) ? orders : [orders];

      return orderList.map(
        (order: Record<string, unknown>): EcOrder => {
          const buyer = (order.Buyer || {}) as Record<string, unknown>;
          const items = order.Items
            ? Array.isArray(order.Items)
              ? (order.Items as Record<string, unknown>[])
              : [order.Items as Record<string, unknown>]
            : [];

          return {
            order_id: String(order.OrderId || ""),
            order_date: order.OrderTime ? new Date(String(order.OrderTime)).toISOString() : "",
            customer_email: String(buyer.Email || ""),
            customer_name: String(buyer.Name || ""),
            total_amount: Number(order.TotalPrice) || 0,
            currency: "JPY",
            status: String(order.OrderStatus || "unknown"),
            items: items.map((item) => ({
              product_id: String(item.ItemId || ""),
              product_name: String(item.Title || ""),
              quantity: Number(item.Quantity) || 1,
              unit_price: Number(item.UnitPrice) || 0,
            })),
            raw_data: order,
          };
        }
      );
    } catch (err) {
      console.error("Yahoo order fetch error:", err);
      return [];
    }
  }

  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `yahoo_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "yahoo",
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

export const yahooConnector = new YahooConnector();
