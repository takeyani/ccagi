// ネクストエンジンAPI連携コネクタ
// API仕様: https://developer.next-engine.com/

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

const NE_API_BASE = "https://api.next-engine.org";
const NE_AUTH_URL = "https://base.next-engine.org/users/sign_in/";

export class NextEngineConnector implements EcConnector {
  type = "next_engine";

  /**
   * ネクストエンジンOAuth2認証
   * アクセストークンの取得・リフレッシュ
   */
  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    const { client_id, client_secret, refresh_token } = config.credentials;

    if (!client_id || !client_secret) return null;

    // リフレッシュトークンでアクセストークンを更新
    if (refresh_token) {
      try {
        const res = await fetch(`${NE_API_BASE}/api_v1_login/access_token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id,
            client_secret,
            refresh_token,
          }),
        });

        const data = await res.json();
        if (data.access_token) {
          return data.access_token;
        }
      } catch (err) {
        console.error("Next Engine token refresh error:", err);
      }
    }

    return null;
  }

  /**
   * OAuth2認証URL生成（初回認証用）
   */
  getAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
    });
    return `${NE_AUTH_URL}?${params.toString()}`;
  }

  /**
   * 認証コード→アクセストークン/リフレッシュトークン交換
   */
  async exchangeCode(
    clientId: string,
    clientSecret: string,
    uid: string,
    state: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    company_name?: string;
  } | null> {
    try {
      const res = await fetch(`${NE_API_BASE}/api_v1_login/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          uid,
          state,
        }),
      });

      const data = await res.json();
      if (data.access_token) {
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          company_name: data.company_name,
        };
      }
      return null;
    } catch (err) {
      console.error("Next Engine code exchange error:", err);
      return null;
    }
  }

  /**
   * 新規受注の取得
   */
  async fetchNewOrders(
    config: EcConnectorConfig,
    since: string | null
  ): Promise<EcOrder[]> {
    const accessToken = await this.authenticate(config);
    if (!accessToken) return [];

    const sinceDate = since
      ? new Date(since)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // デフォルト: 24時間前

    const fields = [
      "receive_order_id",
      "receive_order_date",
      "receive_order_mail_address",
      "receive_order_purchaser_name",
      "receive_order_total_amount",
      "receive_order_status_id",
      "receive_order_shop_id",
      "receive_order_shop_cut_form_id",
      "receive_order_row",
    ].join(",");

    try {
      const res = await fetch(
        `${NE_API_BASE}/api_v1_receive_order/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${accessToken}`,
          },
          body: new URLSearchParams({
            fields,
            receive_order_date_gte: sinceDate.toISOString().slice(0, 19).replace("T", " "),
            limit: "100",
            offset: "0",
          }),
        }
      );

      const data = await res.json();

      if (data.result !== "success" || !data.data) {
        console.error("Next Engine order fetch error:", data.message);
        return [];
      }

      // 受注明細の取得
      const orders: EcOrder[] = [];

      for (const order of data.data) {
        const items = await this.fetchOrderItems(
          accessToken,
          order.receive_order_id
        );

        orders.push({
          order_id: String(order.receive_order_id),
          order_date: order.receive_order_date ? new Date(String(order.receive_order_date)).toISOString() : "",
          customer_email: order.receive_order_mail_address || "",
          customer_name: order.receive_order_purchaser_name || "",
          total_amount: Number(order.receive_order_total_amount) || 0,
          currency: "JPY",
          status: this.mapOrderStatus(order.receive_order_status_id),
          items,
          raw_data: order,
        });
      }

      return orders;
    } catch (err) {
      console.error("Next Engine order fetch error:", err);
      return [];
    }
  }

  /**
   * 受注明細の取得
   */
  private async fetchOrderItems(
    accessToken: string,
    orderId: string
  ): Promise<EcOrder["items"]> {
    try {
      const fields = [
        "receive_order_row_goods_id",
        "receive_order_row_goods_name",
        "receive_order_row_quantity",
        "receive_order_row_unit_price",
      ].join(",");

      const res = await fetch(
        `${NE_API_BASE}/api_v1_receive_order_row/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${accessToken}`,
          },
          body: new URLSearchParams({
            fields,
            receive_order_id_eq: orderId,
          }),
        }
      );

      const data = await res.json();
      if (data.result !== "success" || !data.data) return [];

      return data.data.map(
        (item: Record<string, unknown>) => ({
          product_id: String(item.receive_order_row_goods_id || ""),
          product_name: String(item.receive_order_row_goods_name || ""),
          quantity: Number(item.receive_order_row_quantity) || 1,
          unit_price: Number(item.receive_order_row_unit_price) || 0,
        })
      );
    } catch {
      return [];
    }
  }

  /**
   * ネクストエンジンの受注ステータスIDをマッピング
   */
  private mapOrderStatus(statusId: number | string): string {
    const statusMap: Record<string, string> = {
      "10": "新規受付",
      "15": "確認待ち",
      "20": "確認済み",
      "30": "出荷指示済み",
      "40": "出荷済み",
      "50": "完了",
      "60": "キャンセル",
    };
    return statusMap[String(statusId)] || "不明";
  }

  /**
   * 受注データ→ステップメールイベントに変換
   */
  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `ne_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "next_engine",
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

export const nextEngineConnector = new NextEngineConnector();
