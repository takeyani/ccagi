// カラーミーショップ API連携コネクタ
// API仕様: https://developer.shop-pro.jp/docs/colorme-api

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

const COLORME_API = "https://api.shop-pro.jp/v1";
const COLORME_AUTH_URL = "https://api.shop-pro.jp/oauth/authorize";

export class ColorMeConnector implements EcConnector {
  type = "colorme";

  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    const { access_token } = config.credentials;
    return access_token || null;
  }

  getAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read_sales",
    });
    return `${COLORME_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string } | null> {
    try {
      const res = await fetch(`${COLORME_API}/oauth/token`, {
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
      console.error("ColorMe code exchange error:", err);
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
      const params = new URLSearchParams({ limit: "100" });
      if (since) {
        params.set(
          "after",
          Math.floor(new Date(since).getTime() / 1000).toString()
        );
      }

      const res = await fetch(`${COLORME_API}/sales.json?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!data.sales) return [];

      return data.sales.map(
        (sale: Record<string, unknown>): EcOrder => ({
          order_id: String(sale.id),
          order_date: sale.make_date
            ? new Date(Number(sale.make_date) * 1000).toISOString()
            : "",
          customer_email: String(
            (sale.customer as Record<string, unknown>)?.mail || ""
          ),
          customer_name: String(
            (sale.customer as Record<string, unknown>)?.name || ""
          ),
          total_amount: Number(sale.total_price) || 0,
          currency: "JPY",
          status: sale.paid ? "paid" : "unpaid",
          items: Array.isArray(sale.sale_deliveries)
            ? (sale.sale_deliveries as Record<string, unknown>[]).flatMap(
                (delivery) =>
                  Array.isArray(
                    (delivery as Record<string, unknown>).details
                  )
                    ? (
                        (delivery as Record<string, unknown>)
                          .details as Record<string, unknown>[]
                      ).map((item) => ({
                        product_id: String(item.product_id || ""),
                        product_name: String(item.product_name || ""),
                        quantity: Number(item.product_num) || 1,
                        unit_price: Number(item.price) || 0,
                      }))
                    : []
              )
            : [],
          raw_data: sale,
        })
      );
    } catch (err) {
      console.error("ColorMe order fetch error:", err);
      return [];
    }
  }

  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `colorme_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "colorme",
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

export const colormeConnector = new ColorMeConnector();
