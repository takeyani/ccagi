/**
 * EC連携コネクタテスト
 *
 * 各コネクタのインターフェース準拠・データ変換・エラーハンドリングを検証。
 * 外部APIはモックして、ロジック部分のみテスト。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Supabase mock ---
const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
});
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect, update: mockUpdate });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/step-mail", () => ({
  enrollInCampaign: vi.fn().mockResolvedValue(undefined),
}));

// --- Types ---
import type { EcConnectorConfig, EcOrder } from "@/lib/ec-connectors/types";

const makeConfig = (type: string, credentials: Record<string, string> = {}): EcConnectorConfig => ({
  id: "test-id",
  connector_type: type,
  name: `Test ${type}`,
  credentials: { client_id: "cid", client_secret: "csec", access_token: "tok", ...credentials },
  settings: {},
  is_active: true,
  last_synced_at: null,
  created_at: new Date().toISOString(),
});

const makeSampleOrder = (prefix: string): EcOrder => ({
  order_id: `${prefix}_001`,
  order_date: new Date().toISOString(),
  customer_email: "test@example.com",
  customer_name: "テスト太郎",
  total_amount: 5000,
  currency: "JPY",
  status: "paid",
  items: [
    { product_id: "P001", product_name: "テスト商品", quantity: 2, unit_price: 2500 },
  ],
  raw_data: {},
});

// ===== mapToStepMailEvent 共通テスト =====

describe("EC Connectors - mapToStepMailEvent", () => {
  const connectorModules = [
    { name: "NextEngine", path: "@/lib/ec-connectors/next-engine", type: "next_engine", prefix: "ne" },
    { name: "Shopify", path: "@/lib/ec-connectors/shopify", type: "shopify", prefix: "shopify" },
    { name: "BASE", path: "@/lib/ec-connectors/base-ec", type: "base", prefix: "base" },
    { name: "STORES", path: "@/lib/ec-connectors/stores", type: "stores", prefix: "stores" },
    { name: "MakeShop", path: "@/lib/ec-connectors/makeshop", type: "makeshop", prefix: "makeshop" },
    { name: "ColorMe", path: "@/lib/ec-connectors/colorme", type: "colorme", prefix: "colorme" },
    { name: "Rakuten", path: "@/lib/ec-connectors/rakuten", type: "rakuten", prefix: "rakuten" },
    { name: "Yahoo", path: "@/lib/ec-connectors/yahoo", type: "yahoo", prefix: "yahoo" },
  ];

  for (const { name, path, type, prefix } of connectorModules) {
    describe(name, () => {
      it("mapToStepMailEvent が正しい形式を返す", async () => {
        const mod = await import(path);
        const ConnectorClass = Object.values(mod).find(
          (v) => typeof v === "function" && v !== mod.default
        ) as new () => { mapToStepMailEvent: (order: EcOrder) => Record<string, unknown> };

        // default export のインスタンスも試す
        const connector = mod.default?.mapToStepMailEvent
          ? mod.default
          : new ConnectorClass();

        const order = makeSampleOrder(prefix);
        const event = connector.mapToStepMailEvent(order);

        // 共通フォーマット検証
        expect(event).toHaveProperty("event_type", "purchase");
        expect(event).toHaveProperty("event_id");
        expect(event.event_id).toContain(prefix);
        expect(event).toHaveProperty("customer_email", "test@example.com");
        expect(event).toHaveProperty("customer_name", "テスト太郎");
        expect(event).toHaveProperty("payload");

        const payload = event.payload as Record<string, unknown>;
        expect(payload).toHaveProperty("source", type);
        expect(payload).toHaveProperty("order_id");
        expect(payload).toHaveProperty("amount", 5000);
        expect(payload).toHaveProperty("currency", "JPY");
        expect(payload).toHaveProperty("items");
        expect(Array.isArray(payload.items)).toBe(true);
        const items = payload.items as Record<string, unknown>[];
        expect(items[0]).toHaveProperty("name", "テスト商品");
        expect(items[0]).toHaveProperty("quantity", 2);
        expect(items[0]).toHaveProperty("price", 2500);
      });

      it("type プロパティがコネクタタイプと一致する", async () => {
        const mod = await import(path);
        const ConnectorClass = Object.values(mod).find(
          (v) => typeof v === "function" && v !== mod.default
        ) as new () => { type: string };
        const connector = mod.default?.type ? mod.default : new ConnectorClass();
        expect(connector.type).toBe(type);
      });
    });
  }
});

// ===== authenticate テスト =====

describe("EC Connectors - authenticate", () => {
  it("NextEngine: credentials不足で null を返す", async () => {
    const { NextEngineConnector } = await import("@/lib/ec-connectors/next-engine");
    const connector = new NextEngineConnector();
    const config = makeConfig("next_engine", { client_id: "", client_secret: "" });
    const result = await connector.authenticate(config);
    expect(result).toBeNull();
  });

  it("Shopify: access_token があればそのまま返す", async () => {
    const { ShopifyConnector } = await import("@/lib/ec-connectors/shopify");
    const connector = new ShopifyConnector();
    const config = makeConfig("shopify", { access_token: "shpat_test123" });
    const result = await connector.authenticate(config);
    expect(result).toBe("shpat_test123");
  });

  it("Shopify: access_token がなければ null を返す", async () => {
    const { ShopifyConnector } = await import("@/lib/ec-connectors/shopify");
    const connector = new ShopifyConnector();
    const config = makeConfig("shopify", { access_token: "" });
    const result = await connector.authenticate(config);
    expect(result).toBeNull();
  });

  it("MakeShop: shop_id/api_key があればキーを返す", async () => {
    const { MakeShopConnector } = await import("@/lib/ec-connectors/makeshop");
    const connector = new MakeShopConnector();
    const config = makeConfig("makeshop", { shop_id: "shop1", api_key: "key1" });
    const result = await connector.authenticate(config);
    expect(result).toBe("key1");
  });

  it("MakeShop: shop_id がなければ null を返す", async () => {
    const { MakeShopConnector } = await import("@/lib/ec-connectors/makeshop");
    const connector = new MakeShopConnector();
    const config = makeConfig("makeshop", { shop_id: "", api_key: "key1" });
    const result = await connector.authenticate(config);
    expect(result).toBeNull();
  });

  it("Rakuten: service_secret/license_key で Base64 トークンを返す", async () => {
    const { RakutenConnector } = await import("@/lib/ec-connectors/rakuten");
    const connector = new RakutenConnector();
    const config = makeConfig("rakuten", { service_secret: "sec", license_key: "lic" });
    const result = await connector.authenticate(config);
    expect(result).toBe(Buffer.from("sec:lic").toString("base64"));
  });

  it("ColorMe: access_token があればそのまま返す", async () => {
    const { ColorMeConnector } = await import("@/lib/ec-connectors/colorme");
    const connector = new ColorMeConnector();
    const config = makeConfig("colorme", { access_token: "cm_token" });
    const result = await connector.authenticate(config);
    expect(result).toBe("cm_token");
  });
});

// ===== fetchNewOrders エラーハンドリング =====

describe("EC Connectors - fetchNewOrders エラーハンドリング", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("認証失敗時に空配列を返す（Shopify）", async () => {
    const { ShopifyConnector } = await import("@/lib/ec-connectors/shopify");
    const connector = new ShopifyConnector();
    const config = makeConfig("shopify", { access_token: "", shop_domain: "test.myshopify.com" });
    const orders = await connector.fetchNewOrders(config, null);
    expect(orders).toEqual([]);
  });

  it("shop_domain 未設定時に空配列を返す（Shopify）", async () => {
    const { ShopifyConnector } = await import("@/lib/ec-connectors/shopify");
    const connector = new ShopifyConnector();
    const config = makeConfig("shopify", { access_token: "tok", shop_domain: "" });
    const orders = await connector.fetchNewOrders(config, null);
    expect(orders).toEqual([]);
  });

  it("認証失敗時に空配列を返す（MakeShop）", async () => {
    const { MakeShopConnector } = await import("@/lib/ec-connectors/makeshop");
    const connector = new MakeShopConnector();
    const config = makeConfig("makeshop", { shop_id: "", api_key: "" });
    const orders = await connector.fetchNewOrders(config, null);
    expect(orders).toEqual([]);
  });

  it("seller_id 未設定時に空配列を返す（Yahoo）", async () => {
    const { YahooConnector } = await import("@/lib/ec-connectors/yahoo");
    const connector = new YahooConnector();
    const config = makeConfig("yahoo", { access_token: "tok", seller_id: "" });
    const orders = await connector.fetchNewOrders(config, null);
    expect(orders).toEqual([]);
  });
});

// ===== syncConnector 統合テスト =====

describe("syncConnector", () => {
  it("未知のコネクタタイプでエラーを返す", async () => {
    const { syncConnector } = await import("@/lib/ec-connectors");
    const config = makeConfig("unknown_platform");
    const result = await syncConnector(config);
    expect(result.errors).toContain("Unknown connector type: unknown_platform");
    expect(result.orders_fetched).toBe(0);
  });

  it("非アクティブなコネクタでエラーを返す", async () => {
    const { syncConnector } = await import("@/lib/ec-connectors");
    const config = { ...makeConfig("shopify"), is_active: false };
    const result = await syncConnector(config);
    expect(result.errors).toContain("Connector is inactive");
  });

  it("getAvailableConnectors が全8コネクタを返す", async () => {
    const { getAvailableConnectors } = await import("@/lib/ec-connectors");
    const connectors = getAvailableConnectors();
    expect(connectors).toHaveLength(8);
    expect(connectors).toContain("next_engine");
    expect(connectors).toContain("shopify");
    expect(connectors).toContain("base");
    expect(connectors).toContain("stores");
    expect(connectors).toContain("makeshop");
    expect(connectors).toContain("colorme");
    expect(connectors).toContain("rakuten");
    expect(connectors).toContain("yahoo");
  });
});
