import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    default:
      from = new Date("2000-01-01");
      break;
  }
  return { from: from.toISOString(), to };
}

export default async function AdminRankingsPage({ searchParams }: Props) {
  const { period = "monthly", category = "" } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { from, to } = getDateRange(period);

  // カテゴリ一覧
  const { data: categories } = await supabase
    .from("tags")
    .select("id, name")
    .eq("tag_type", "カテゴリ")
    .eq("is_active", true)
    .order("sort_order");

  // カテゴリフィルタ
  let productIdFilter: string[] | null = null;
  if (category) {
    const { data: productTags } = await supabase
      .from("product_tags")
      .select("product_id")
      .eq("tag_id", category);
    productIdFilter = (productTags ?? []).map((pt) => pt.product_id);
  }

  // ownership_records
  const { data: records } = await supabase
    .from("ownership_records")
    .select("lot_id, quantity, transferred_at, lots(id, price, product_id, products(id, name, base_price, partner_id, partners(id, company_name, partner_type)))")
    .in("transfer_type", ["購入", "落札"])
    .eq("status", "確定")
    .gte("transferred_at", from)
    .lte("transferred_at", to);

  // 入金済み請求書も取得（管理者向け）
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("total, partner_id, partners(id, company_name, partner_type)")
    .eq("status", "入金済み")
    .gte("created_at", from)
    .lte("created_at", to);

  type ProductAgg = {
    product_id: string;
    product_name: string;
    total_sales: number;
    total_quantity: number;
    partner_id: string | null;
    partner_name: string | null;
  };
  const productMap = new Map<string, ProductAgg>();

  type PartnerAgg = {
    partner_id: string;
    company_name: string;
    total_sales: number;
    total_quantity: number;
  };
  const dealerMap = new Map<string, PartnerAgg>();
  const allPartnerMap = new Map<string, PartnerAgg>();

  for (const rec of records ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lotRaw = rec.lots as any;
    const lot = (Array.isArray(lotRaw) ? lotRaw[0] : lotRaw) as {
      id: string;
      price: number | null;
      product_id: string;
      products: unknown;
    } | null;

    if (!lot) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productsRaw = lot.products as any;
    const product = (Array.isArray(productsRaw) ? productsRaw[0] : productsRaw) as {
      id: string;
      name: string;
      base_price: number;
      partner_id: string | null;
      partners: unknown;
    } | null;
    if (!product) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnersRaw = product.partners as any;
    const partner = (Array.isArray(partnersRaw) ? partnersRaw[0] : partnersRaw) as { id: string; company_name: string; partner_type: string } | null;
    const unitPrice = lot.price ?? product.base_price;
    const amount = unitPrice * (rec.quantity ?? 1);

    if (productIdFilter && !productIdFilter.includes(product.id)) continue;

    const existing = productMap.get(product.id) ?? {
      product_id: product.id,
      product_name: product.name,
      total_sales: 0,
      total_quantity: 0,
      partner_id: product.partner_id,
      partner_name: partner?.company_name ?? null,
    };
    existing.total_sales += amount;
    existing.total_quantity += rec.quantity ?? 1;
    productMap.set(product.id, existing);

    // 代理店集計
    if (partner?.partner_type === "代理店") {
      const pid = partner.id;
      const pe = dealerMap.get(pid) ?? {
        partner_id: pid,
        company_name: partner.company_name,
        total_sales: 0,
        total_quantity: 0,
      };
      pe.total_sales += amount;
      pe.total_quantity += rec.quantity ?? 1;
      dealerMap.set(pid, pe);
    }
  }

  // 請求書ベースのパートナー売上ランキング（管理者向け追加情報）
  for (const inv of paidInvoices ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnersRaw = inv.partners as any;
    const invPartner = (Array.isArray(partnersRaw) ? partnersRaw[0] : partnersRaw) as { id: string; company_name: string; partner_type: string } | null;
    if (!invPartner) continue;
    const pid = invPartner.id;
    const pe = allPartnerMap.get(pid) ?? {
      partner_id: pid,
      company_name: invPartner.company_name,
      total_sales: 0,
      total_quantity: 0,
    };
    pe.total_sales += inv.total ?? 0;
    allPartnerMap.set(pid, pe);
  }

  const salesRanking = Array.from(productMap.values())
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 30)
    .map((p, i) => ({
      rank: i + 1,
      name: p.product_name,
      subLabel: p.partner_name ?? undefined,
      value: p.total_sales,
      formattedValue: `¥${p.total_sales.toLocaleString()}`,
    }));

  const volumeRanking = Array.from(productMap.values())
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 30)
    .map((p, i) => ({
      rank: i + 1,
      name: p.product_name,
      subLabel: p.partner_name ?? undefined,
      value: p.total_quantity,
      formattedValue: `${p.total_quantity.toLocaleString()} 個`,
    }));

  const dealerRanking = Array.from(dealerMap.values())
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 30)
    .map((p, i) => ({
      rank: i + 1,
      name: p.company_name,
      subLabel: `${p.total_quantity} 個販売`,
      value: p.total_sales,
      formattedValue: `¥${p.total_sales.toLocaleString()}`,
    }));

  // 請求書ベース: 全パートナーランキング
  const invoiceRanking = Array.from(allPartnerMap.values())
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 30)
    .map((p, i) => ({
      rank: i + 1,
      name: p.company_name,
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
    <div>
      <h1 className="text-2xl font-bold mb-2">ランキング</h1>
      <p className="text-gray-500 text-sm mb-6">
        {periodLabels[period] ?? "今月"}の集計
      </p>

      <RankingFilter
        categories={categories ?? []}
        basePath="/admin/rankings"
      />

      <div className="grid grid-cols-2 gap-8">
        {/* 売上ランキング */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            売上ランキング
          </h2>
          <RankingTable items={salesRanking} valueLabel="売上額" />
        </section>

        {/* 販売数ランキング */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            販売数ランキング
          </h2>
          <RankingTable items={volumeRanking} valueLabel="販売数" />
        </section>

        {/* 代理店ランキング */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            代理店ランキング
          </h2>
          <RankingTable items={dealerRanking} valueLabel="売上額" />
        </section>

        {/* 請求書ベース パートナー売上 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            パートナー売上（請求書ベース）
          </h2>
          <RankingTable items={invoiceRanking} valueLabel="入金額" />
        </section>
      </div>
    </div>
  );
}
