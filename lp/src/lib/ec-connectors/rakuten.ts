// 楽天市場 RMS API連携コネクタ
// API仕様: https://webservice.rms.rakuten.co.jp/merchant-portal/

import type { EcConnector, EcConnectorConfig, EcOrder } from "./types";

const RAKUTEN_API = "https://api.rms.rakuten.co.jp/es/2.0";

export class RakutenConnector implements EcConnector {
  type = "rakuten";

  async authenticate(config: EcConnectorConfig): Promise<string | null> {
    // 楽天RMSはサービスシークレット + ライセンスキー認証
    const { service_secret, license_key } = config.credentials;
    if (!service_secret || !license_key) return null;
    // Base64エンコードした認証トークンを返す
    const token = Buffer.from(`${service_secret}:${license_key}`).toString(
      "base64"
    );
    return token;
  }

  async fetchNewOrders(
    config: EcConnectorConfig,
    since: string | null
  ): Promise<EcOrder[]> {
    const authToken = await this.authenticate(config);
    if (!authToken) return [];

    const sinceDate = since
      ? new Date(since)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) =>
      d.toISOString().slice(0, 19).replace("T", " ");

    try {
      const res = await fetch(`${RAKUTEN_API}/order/searchOrder/`, {
        method: "POST",
        headers: {
          Authorization: `ESA ${authToken}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          dateType: 1, // 注文日
          startDatetime: formatDate(sinceDate),
          endDatetime: formatDate(new Date()),
          PaginationRequestModel: {
            requestRecordsAmount: 100,
            requestPage: 1,
          },
        }),
      });

      const data = await res.json();
      if (!data.orderNumberList?.length) return [];

      // 注文番号一覧から詳細取得
      const detailRes = await fetch(`${RAKUTEN_API}/order/getOrder/`, {
        method: "POST",
        headers: {
          Authorization: `ESA ${authToken}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          orderNumberList: data.orderNumberList,
          version: 7,
        }),
      });

      const detailData = await detailRes.json();
      if (!detailData.OrderModelList) return [];

      return detailData.OrderModelList.map(
        (order: Record<string, unknown>): EcOrder => {
          const buyer = (order.OrdererModel || {}) as Record<string, unknown>;
          const items = Array.isArray(order.PackageModelList)
            ? (order.PackageModelList as Record<string, unknown>[]).flatMap(
                (pkg) =>
                  Array.isArray(
                    (pkg as Record<string, unknown>).ItemModelList
                  )
                    ? (
                        (pkg as Record<string, unknown>)
                          .ItemModelList as Record<string, unknown>[]
                      ).map((item) => ({
                        product_id: String(item.itemId || ""),
                        product_name: String(item.itemName || ""),
                        quantity: Number(item.units) || 1,
                        unit_price: Number(item.price) || 0,
                      }))
                    : []
              )
            : [];

          return {
            order_id: String(order.orderNumber),
            order_date: order.orderDatetime ? new Date(String(order.orderDatetime)).toISOString() : "",
            customer_email: String(buyer.emailAddress || ""),
            customer_name: [buyer.familyName, buyer.firstName]
              .filter(Boolean)
              .join("") || "",
            total_amount: Number(order.totalPrice) || 0,
            currency: "JPY",
            status: String(order.orderStatus || "unknown"),
            items,
            raw_data: order,
          };
        }
      );
    } catch (err) {
      console.error("Rakuten order fetch error:", err);
      return [];
    }
  }

  mapToStepMailEvent(order: EcOrder) {
    return {
      event_type: "purchase" as const,
      event_id: `rakuten_${order.order_id}`,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payload: {
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        source: "rakuten",
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

export const rakutenConnector = new RakutenConnector();
