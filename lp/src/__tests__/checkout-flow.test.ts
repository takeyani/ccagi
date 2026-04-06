/**
 * チェックアウトフローテスト
 *
 * 在庫予約 → Stripe決済 → 購入記録の一連のフローを検証。
 * Stripe・Supabaseはモックして、ロジック部分のみテスト。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock setup ---
const mockRpc = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom: ReturnType<typeof vi.fn> = vi.fn((_table?: string) => ({ select: mockSelect }));
const mockSupabase = { from: mockFrom, rpc: mockRpc };

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => mockSupabase,
}));

const mockStripeCreate = vi.fn();
vi.mock("stripe", () => {
  const MockStripe = function() {
    return { checkout: { sessions: { create: mockStripeCreate } } };
  };
  return { default: MockStripe };
});

// Set env vars
vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_xxx");
vi.stubEnv("STRIPE_PRICE_ID", "price_default");
vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Helper: set up mocks for a full happy-path checkout
function setupHappyPath(opts: {
  lot?: Record<string, unknown>;
  product?: Record<string, unknown>;
  reserveOk?: boolean;
  stripeUrl?: string;
}) {
  const lot = opts.lot ?? {
    id: "lot-1", product_id: "p1", status: "販売中", stock: 5,
    expiration_date: null, stripe_price_id: "price_lot",
  };
  const product = opts.product ?? {
    id: "p1", is_active: true, stripe_price_id: "price_prod",
  };

  // The checkout route calls from("lots").select("*").eq("id", lotId).single()
  // then from("products").select("*").eq("id", product_id).single()
  // We need mockSingle to return lot first, then product
  let singleCallCount = 0;
  mockSingle.mockImplementation(() => {
    singleCallCount++;
    if (singleCallCount === 1) return Promise.resolve({ data: lot, error: null });
    return Promise.resolve({ data: product, error: null });
  });

  mockRpc.mockResolvedValue({ data: opts.reserveOk ?? true, error: null });
  mockStripeCreate.mockResolvedValue({ url: opts.stripeUrl ?? "https://checkout.stripe.com/ok" });
}

describe("POST /api/checkout", () => {
  let handler: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset mockSingle to default behavior
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const mod = await import("@/app/api/checkout/route");
    handler = mod.POST;
  });

  it("returns 404 when lot not found", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await handler(makeRequest({ lot_id: "nonexistent" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain("見つかりません");
  });

  it("returns 400 when lot is sold out (stock=0)", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: "lot-1", product_id: "p1", status: "販売中", stock: 0 },
      error: null,
    });

    const res = await handler(makeRequest({ lot_id: "lot-1" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("購入できません");
  });

  it("returns 400 when lot status is not 販売中", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: "lot-1", product_id: "p1", status: "売切れ", stock: 5 },
      error: null,
    });

    const res = await handler(makeRequest({ lot_id: "lot-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when lot is expired", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "lot-1", product_id: "p1", status: "販売中",
        stock: 5, expiration_date: "2020-01-01",
      },
      error: null,
    });

    const res = await handler(makeRequest({ lot_id: "lot-1" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("販売期間");
  });

  it("returns 400 when reserve_lot_stock fails (returns false)", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "lot-1", product_id: "p1", status: "販売中",
        stock: 1, expiration_date: null,
      },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({ data: false, error: null });

    const res = await handler(makeRequest({ lot_id: "lot-1" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("在庫が確保できません");
  });

  it("returns 400 when reserve_lot_stock returns error", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "lot-1", product_id: "p1", status: "販売中",
        stock: 1, expiration_date: null,
      },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: "stock unavailable" } });

    const res = await handler(makeRequest({ lot_id: "lot-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when product not found after reservation", async () => {
    let callNum = 0;
    mockSingle.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        return Promise.resolve({
          data: {
            id: "lot-1", product_id: "p1", status: "販売中",
            stock: 5, expiration_date: null, stripe_price_id: null,
          },
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
    mockRpc.mockResolvedValueOnce({ data: true, error: null });

    const res = await handler(makeRequest({ lot_id: "lot-1" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain("商品");
  });

  it("creates Stripe session with lot metadata on success", async () => {
    setupHappyPath({
      lot: { id: "lot-1", product_id: "p1", status: "販売中", stock: 5, expiration_date: null, stripe_price_id: "price_lot" },
      product: { id: "p1", is_active: true, stripe_price_id: "price_prod" },
      stripeUrl: "https://checkout.stripe.com/session",
    });

    const res = await handler(makeRequest({ lot_id: "lot-1" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://checkout.stripe.com/session");

    expect(mockStripeCreate).toHaveBeenCalledOnce();
    const stripeArgs = mockStripeCreate.mock.calls[0][0];
    expect(stripeArgs.metadata.lot_id).toBe("lot-1");
    expect(stripeArgs.metadata.product_id).toBe("p1");
    expect(stripeArgs.line_items[0].price).toBe("price_lot");
  });

  it("falls back to product price when lot has no stripe_price_id", async () => {
    setupHappyPath({
      lot: { id: "lot-2", product_id: "p2", status: "販売中", stock: 3, expiration_date: null, stripe_price_id: null },
      product: { id: "p2", is_active: true, stripe_price_id: "price_product" },
    });

    const res = await handler(makeRequest({ lot_id: "lot-2" }));
    expect(res.status).toBe(200);

    const stripeArgs = mockStripeCreate.mock.calls[0][0];
    expect(stripeArgs.line_items[0].price).toBe("price_product");
  });

  it("includes affiliate code in metadata when valid ref provided", async () => {
    // Override mockFrom to handle affiliate lookup then lot/product lookups
    let fromCallCount = 0;
    mockFrom.mockImplementation((table) => {
      if (table === "affiliates") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { code: "aff-123" }, error: null }),
            })),
          })),
        };
      }
      fromCallCount++;
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockImplementation(() => {
              if (fromCallCount === 1) {
                return Promise.resolve({
                  data: {
                    id: "lot-1", product_id: "p1", status: "販売中",
                    stock: 5, expiration_date: null, stripe_price_id: "price_lot",
                  },
                  error: null,
                });
              }
              return Promise.resolve({
                data: { id: "p1", is_active: true, stripe_price_id: null },
                error: null,
              });
            }),
          })),
        })),
      };
    });
    mockRpc.mockResolvedValueOnce({ data: true, error: null });
    mockStripeCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/s3" });

    const res = await handler(makeRequest({ lot_id: "lot-1", ref: "aff-123" }));
    expect(res.status).toBe(200);

    const stripeArgs = mockStripeCreate.mock.calls[0][0];
    expect(stripeArgs.metadata.affiliate_code).toBe("aff-123");
  });

  it("handles non-lot purchase (legacy flow)", async () => {
    mockStripeCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/legacy" });

    const res = await handler(makeRequest({}));
    expect(res.status).toBe(200);

    const stripeArgs = mockStripeCreate.mock.calls[0][0];
    expect(stripeArgs.line_items[0].price).toBe("price_default");
    expect(stripeArgs.metadata.lot_id).toBeUndefined();
  });
});

// =====================================================================
// 在庫予約の順序検証
// =====================================================================
describe("Stock reservation ordering", () => {
  it("reserve_lot_stock is called BEFORE Stripe session creation", async () => {
    const callOrder: string[] = [];

    mockFrom.mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockImplementation(() => {
            if (!callOrder.includes("lot_query")) {
              callOrder.push("lot_query");
              return Promise.resolve({
                data: {
                  id: "lot-1", product_id: "p1", status: "販売中",
                  stock: 1, expiration_date: null, stripe_price_id: "price_1",
                },
                error: null,
              });
            }
            callOrder.push("product_query");
            return Promise.resolve({
              data: { id: "p1", is_active: true, stripe_price_id: null },
              error: null,
            });
          }),
        })),
      })),
    }));

    mockRpc.mockImplementation(() => {
      callOrder.push("reserve_lot_stock");
      return Promise.resolve({ data: true, error: null });
    });

    mockStripeCreate.mockImplementation(() => {
      callOrder.push("stripe_create");
      return Promise.resolve({ url: "https://stripe.com/s" });
    });

    const mod = await import("@/app/api/checkout/route");
    await mod.POST(makeRequest({ lot_id: "lot-1" }));

    const reserveIdx = callOrder.indexOf("reserve_lot_stock");
    const stripeIdx = callOrder.indexOf("stripe_create");
    expect(reserveIdx).toBeGreaterThan(-1);
    expect(stripeIdx).toBeGreaterThan(-1);
    expect(reserveIdx).toBeLessThan(stripeIdx);
  });
});
