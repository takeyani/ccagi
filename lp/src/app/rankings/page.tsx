import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { RankingFilter } from "@/components/rankings/RankingFilter";
import { RankingTable } from "@/components/rankings/RankingTable";

type Props = {
  searchParams: Promise<{ period?: string; category?: string }>;
};

function getDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;

  switch (period) {
    case "daily":
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      from = new Date(now);
      from.setDate(from.getDate() - 7);
      break;
    case "monthly":
      from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      break;
    case "yearly":
      from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      break;
    default: // all
      from = new Date("2000-01-01");
      break;
  }
  return { from: from.toISOString(), to };
}

export default async function RankingsPage({ searchParams }: Props) {
  const { period = "monthly", category = "" } = await searchParams;
  const supabase = getSupabase();
  const { from, to } = getDateRange(period);

  // カテゴリ一覧取得
  const { data: categories } = await supabase
    .from("tags")
    .select("id, name")
    .eq("tag_type", "カテゴリ")
    .eq("is_active", true)
    .order("sort_order");

  // カテゴリフィルタ用: 対象商品IDリスト
  let productIdFilter: string[] | null = null;
  if (category) {
    const { data: productTags } = await supabase
      .from("product_tags")
      .select("product_id")
      .eq("tag_id", category);
    productIdFilter = (productTags ?? []).map((pt) => pt.product_id);
  }

  // ownership_records（確定済み購入+落札）を取得
  let query = supabase
    .from("ownership_records")
    .select("lot_id, quantity, transferred_at, lots(id, price, product_id, products(id, name, base_price, partner_id, partners(id, company_name, partner_type)))")
    .in("transfer_type", ["購入", "落札"])
    .eq("status", "確定")
    .gte("transferred_at", from)
    .lte("transferred_at", to);

  const { data: records } = await query;

  // 商品別集計
  type ProductAgg = {
    product_id: string;
    product_name: string;
    total_sales: number;
    total_quantity: number;
    partner_id: string | null;
    partner_name: string | null;
    partner_type: string | null;
  };

  const productMap = new Map<string, ProductAgg>();
  type PartnerAgg = {
    partner_id: string;
    company_name: string;
    total_sales: number;
    total_quantity: number;
  };
  const partnerMap = new Map<string, PartnerAgg>();

  for (const rec of records ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lotRaw = rec.lots as any;
    const lot = (Array.isArray(lotRaw) ? lotRaw[0] : lotRaw) as {
      id: string;
      price: number | null;
      product_id: string;
      products: {
        id: string;
        name: string;
        base_price: number;
        partner_id: string | null;
        partners: { id: string; company_name: string; partner_type: string } | null;
      } | null;
    } | null;

    if (!lot) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productsRaw = lot.products as any;
    const product = (Array.isArray(productsRaw) ? productsRaw[0] : productsRaw) as {
      id: string;
      name: string;
      base_price: number;
      partner_id: string | null;
      partners: { id: string; company_name: string; partner_type: string } | null;
    } | null;
    if (!product) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnersRaw = product.partners as any;
    const partner = (Array.isArray(partnersRaw) ? partnersRaw[0] : partnersRaw) as { id: string; company_name: string; partner_type: string } | null;
    const unitPrice = lot.price ?? product.base_price;
    const amount = unitPrice * (rec.quantity ?? 1);

    // カテゴリフィルタ
    if (productIdFilter && !productIdFilter.includes(product.id)) continue;

    // 商品集計
    const existing = productMap.get(product.id) ?? {
      product_id: product.id,
      product_name: product.name,
      total_sales: 0,
      total_quantity: 0,
      partner_id: product.partner_id,
      partner_name: partner?.company_name ?? null,
      partner_type: partner?.partner_type ?? null,
    };
    existing.total_sales += amount;
    existing.total_quantity += rec.quantity ?? 1;
    productMap.set(product.id, existing);

    // 代理店集計
    if (partner && partner.partner_type === "代理店") {
      const pid = partner.id;
      const pe = partnerMap.get(pid) ?? {
        partner_id: pid,
        company_name: partner.company_name,
        total_sales: 0,
        total_quantity: 0,
      };
      pe.total_sales += amount;
      pe.total_quantity += rec.quantity ?? 1;
      partnerMap.set(pid, pe);
    }
  }

  // ランキング生成
  const salesRanking = Array.from(productMap.values())
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 20)
    .map((p, i) => ({
      rank: i + 1,
      name: p.product_name,
      subLabel: p.partner_name ?? undefined,
      value: p.total_sales,
      formattedValue: `¥${p.total_sales.toLocaleString()}`,
    }));

  const volumeRanking = Array.from(productMap.values())
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 20)
    .map((p, i) => ({
      rank: i + 1,
      name: p.product_name,
      subLabel: p.partner_name ?? undefined,
      value: p.total_quantity,
      formattedValue: `${p.total_quantity.toLocaleString()} 個`,
    }));

  const dealerRanking = Array.from(partnerMap.values())
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 20)
    .map((p, i) => ({
      rank: i + 1,
      name: p.company_name,
      subLabel: `${p.total_quantity} 個販売`,
      value: p.total_sales,
      formattedValue: `¥${p.total_sales.toLocaleString()}`,
    }));

  const periodLabels: Record<string, string> = {
    daily: "本日",
    weekly: "今週",
    monthly: "今月",
    yearly: "今年",
    all: "全期間",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; トップページに戻る
          </Link>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">ランキング</h1>
        <p className="text-gray-500 text-sm mb-6">
          {periodLabels[period] ?? "今月"}のランキング
        </p>

        <RankingFilter
          categories={categories ?? []}
          basePath="/rankings"
        />

        {/* 売上ランキング */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            売上ランキング
          </h2>
          <RankingTable items={salesRanking} valueLabel="売上額" />
        </section>

        {/* 販売数ランキング */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            販売数ランキング
          </h2>
          <RankingTable items={volumeRanking} valueLabel="販売数" />
        </section>

        {/* 代理店ランキング */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            代理店ランキング
          </h2>
          <RankingTable items={dealerRanking} valueLabel="売上額" />
        </section>
      </div>
    </div>
  );
}
