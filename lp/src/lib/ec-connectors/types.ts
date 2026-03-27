// EC連携コネクタ共通型定義

export type EcConnectorConfig = {
  id: string;
  connector_type: string; // 'next_engine' | 'shopify' | 'base' | 'stores' | 'makeshop' | 'colorme' | 'rakuten' | 'yahoo'
  name: string;
  credentials: Record<string, string>; // 暗号化されたOAuth/API認証情報
  settings: Record<string, unknown>;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
};

export type EcOrder = {
  order_id: string;
  order_date: string;
  customer_email: string;
  customer_name: string;
  total_amount: number;
  currency: string;
  status: string;
  items: EcOrderItem[];
  raw_data: Record<string, unknown>; // 元のAPIレスポンス
};

export type EcOrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type EcSyncResult = {
  connector_type: string;
  orders_fetched: number;
  events_created: number;
  errors: string[];
  synced_at: string;
};

// コネクタ共通インターフェース
export interface EcConnector {
  type: string;
  authenticate(config: EcConnectorConfig): Promise<string | null>; // returns access_token or null
  fetchNewOrders(
    config: EcConnectorConfig,
    since: string | null
  ): Promise<EcOrder[]>;
  mapToStepMailEvent(order: EcOrder): {
    event_type: string;
    event_id: string;
    customer_email: string;
    customer_name: string;
    payload: Record<string, unknown>;
  };
}
