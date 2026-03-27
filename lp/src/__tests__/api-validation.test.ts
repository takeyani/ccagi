/**
 * API入力バリデーションテスト
 *
 * 各APIルートの入力検証ロジックをテスト。
 * Supabaseはモックして、バリデーション部分のみ検証する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Supabase mock ---
const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockSelect = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) });
const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null });
const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
});
const mockSupabase = { from: mockFrom, rpc: mockRpc };

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => mockSupabase,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mockSupabase,
}));

// Helper to create Request objects
function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// =====================================================================
// Affiliate Registration
// =====================================================================
describe("POST /api/affiliates/register", () => {
  let handler: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const mod = await import("@/app/api/affiliates/register/route");
    handler = mod.POST;
  });

  it("rejects missing name", async () => {
    const res = await handler(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("必須");
  });

  it("rejects missing email", async () => {
    const res = await handler(makeRequest({ name: "Test" }));
    expect(res.status).toBe(400);
  });

  it("rejects name over 100 chars", async () => {
    const res = await handler(makeRequest({ name: "a".repeat(101), email: "a@b.com" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("100文字");
  });

  it("rejects invalid email format", async () => {
    const res = await handler(makeRequest({ name: "Test", email: "not-email" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("メールアドレス");
  });

  it("accepts valid input", async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { code: "test-1234" }, error: null }),
      }),
    });
    const res = await handler(makeRequest({ name: "Test User", email: "test@example.com" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.code).toBeDefined();
  });
});

// =====================================================================
// Board Threads
// =====================================================================
describe("POST /api/boards/threads", () => {
  let handler: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/boards/threads/route");
    handler = mod.POST;
  });

  it("rejects missing required fields", async () => {
    const res = await handler(makeRequest({ title: "test" }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid target_type", async () => {
    const res = await handler(makeRequest({
      target_type: "invalid",
      target_id: "uuid",
      title: "Test",
      author_name: "User",
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("target_type");
  });

  it("rejects title over 200 chars", async () => {
    const res = await handler(makeRequest({
      target_type: "product",
      target_id: "uuid",
      title: "a".repeat(201),
      author_name: "User",
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("200文字");
  });

  it("rejects author_name over 100 chars", async () => {
    const res = await handler(makeRequest({
      target_type: "product",
      target_id: "uuid",
      title: "Test",
      author_name: "a".repeat(101),
    }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid email format", async () => {
    const res = await handler(makeRequest({
      target_type: "product",
      target_id: "uuid",
      title: "Test",
      author_name: "User",
      author_email: "bad-email",
    }));
    expect(res.status).toBe(400);
  });

  it("accepts valid product thread", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "thread-1" }, error: null }),
        }),
      }),
    });
    const res = await handler(makeRequest({
      target_type: "product",
      target_id: "uuid-123",
      title: "Question about product",
      author_name: "User",
    }));
    expect(res.status).toBe(200);
  });
});

// =====================================================================
// Board Posts
// =====================================================================
describe("POST /api/boards/posts", () => {
  let handler: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/boards/posts/route");
    handler = mod.POST;
  });

  it("rejects missing fields", async () => {
    const res = await handler(makeRequest({ thread_id: "t1" }));
    expect(res.status).toBe(400);
  });

  it("rejects body over 5000 chars", async () => {
    const res = await handler(makeRequest({
      thread_id: "t1",
      author_name: "User",
      body: "a".repeat(5001),
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("5000文字");
  });

  it("rejects author_name over 100 chars", async () => {
    const res = await handler(makeRequest({
      thread_id: "t1",
      author_name: "a".repeat(101),
      body: "Hello",
    }));
    expect(res.status).toBe(400);
  });
});

// =====================================================================
// Requests (入荷リクエスト)
// =====================================================================
describe("POST /api/requests", () => {
  let handler: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/requests/route");
    handler = mod.POST;
  });

  it("rejects missing required fields", async () => {
    const res = await handler(makeRequest({ name: "Test" }));
    expect(res.status).toBe(400);
  });

  it("rejects name over 100 chars", async () => {
    const res = await handler(makeRequest({
      name: "a".repeat(101),
      email: "a@b.com",
      description: "test",
      budget: "1000",
    }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid email", async () => {
    const res = await handler(makeRequest({
      name: "Test",
      email: "invalid",
      description: "test",
      budget: "1000",
    }));
    expect(res.status).toBe(400);
  });

  it("rejects description over 5000 chars", async () => {
    const res = await handler(makeRequest({
      name: "Test",
      email: "a@b.com",
      description: "a".repeat(5001),
      budget: "1000",
    }));
    expect(res.status).toBe(400);
  });

  it("rejects budget over 100 chars", async () => {
    const res = await handler(makeRequest({
      name: "Test",
      email: "a@b.com",
      description: "test",
      budget: "a".repeat(101),
    }));
    expect(res.status).toBe(400);
  });
});

// =====================================================================
// Auction Bid
// =====================================================================
describe("POST /api/auctions/bid", () => {
  let handler: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({
      data: { success: true, amount: 1000, status: "落札済み" },
      error: null,
    });
    const mod = await import("@/app/api/auctions/bid/route");
    handler = mod.POST;
  });

  it("rejects missing required fields", async () => {
    const res = await handler(makeRequest({ auction_id: "a1" }));
    expect(res.status).toBe(400);
  });

  it("rejects non-positive bid amount", async () => {
    const res = await handler(makeRequest({
      auction_id: "a1",
      bidder_name: "User",
      bidder_email: "a@b.com",
      amount: -100,
    }));
    expect(res.status).toBe(400);
  });

  it("rejects non-integer bid amount", async () => {
    const res = await handler(makeRequest({
      auction_id: "a1",
      bidder_name: "User",
      bidder_email: "a@b.com",
      amount: 10.5,
    }));
    expect(res.status).toBe(400);
  });

  it("rejects bidder_name over 100 chars", async () => {
    const res = await handler(makeRequest({
      auction_id: "a1",
      bidder_name: "a".repeat(101),
      bidder_email: "a@b.com",
      amount: 1000,
    }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid email", async () => {
    const res = await handler(makeRequest({
      auction_id: "a1",
      bidder_name: "User",
      bidder_email: "not-an-email",
      amount: 1000,
    }));
    expect(res.status).toBe(400);
  });

  it("accepts valid bid", async () => {
    const res = await handler(makeRequest({
      auction_id: "a1",
      bidder_name: "User",
      bidder_email: "a@b.com",
      amount: 1000,
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
