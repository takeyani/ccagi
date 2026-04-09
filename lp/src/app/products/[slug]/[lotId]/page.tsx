import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import LotPurchaseButton from "@/components/LotPurchaseButton";
import RecurringPurchaseForm from "@/components/RecurringPurchaseForm";
import { SurveySection } from "@/components/surveys/SurveySection";
import { NonFinancialSurvey } from "@/components/surveys/NonFinancialSurvey";
import { BoardSection } from "@/components/boards/BoardSection";
import { QuestionSection } from "@/components/questions/QuestionSection";
import { LPViewTracker } from "@/components/LPViewTracker";
import type { Product, Lot, Partner, Auction, Tag, CategoryTemplate } from "@/lib/types";
import { CATEGORY_TEMPLATES } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string; lotId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lotId } = await params;
  const { data: product } = await getSupabase()
    .from("products")
    .select("name, description, image_url, base_price")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) return { title: "商品が見つかりません" };

  const { data: lot } = await getSupabase()
    .from("lots")
    .select("price, lot_number")
    .eq("id", lotId)
    .single();

  const price = lot?.price ?? product.base_price;
  const title = `${product.name}${price ? ` - ¥${price.toLocaleString()}` : ""}`;
  const description = product.description?.slice(0, 160) || `${product.name}の商品ページ`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(product.image_url ? { images: [{ url: product.image_url }] } : {}),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(product.image_url ? { images: [product.image_url] } : {}),
    },
  };
}

export default async function LotPage({ params }: Props) {
  const { slug, lotId } = await params;

  const { data: product } = await getSupabase()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Product>();

  if (!product) notFound();

  // 取引先情報を取得
  let partner: Partner | null = null;
  let parentPartner: Partner | null = null;

  if (product.partner_id) {
    const { data } = await getSupabase()
      .from("partners")
      .select("*")
      .eq("id", product.partner_id)
      .single<Partner>();
    partner = data;

    // 代理店の場合、親メーカーを取得
    if (partner?.partner_type === "代理店" && partner.parent_partner_id) {
      const { data: parent } = await getSupabase()
        .from("partners")
        .select("*")
        .eq("id", partner.parent_partner_id)
        .single<Partner>();
      parentPartner = parent;
    }
  }

  const showBadge = partner?.certification_status === "認証済み";

  const { data: lot } = await getSupabase()
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .eq("product_id", product.id)
    .single<Lot>();

  if (!lot) notFound();

  // 商品タグ取得
  const { data: productTags } = await getSupabase()
    .from("product_tags")
    .select("tag_id, tags(*)")
    .eq("product_id", product.id);

  const productTagList = (productTags ?? [])
    .map((pt: Record<string, unknown>) => pt.tags as Tag | null)
    .filter((t): t is Tag => t !== null && t.is_active);

  // オークション確認
  const { data: auction } = await getSupabase()
    .from("auctions")
    .select("*")
    .eq("lot_id", lotId)
    .single<Auction>();

  const hasActiveAuction =
    auction && auction.status === "出品中" && new Date(auction.ends_at) > new Date();

  const price = lot.price ?? product.base_price;
  const formattedPrice = price.toLocaleString("ja-JP");

  const isExpired =
    lot.expiration_date && new Date(lot.expiration_date) < new Date();
  const canPurchase =
    lot.status === "販売中" && lot.stock > 0 && !isExpired;

  let statusLabel = "今すぐ購入する";
  if (lot.status === "売切れ" || lot.stock <= 0) {
    statusLabel = "売切れ";
  } else if (lot.status === "期限切れ" || isExpired) {
    statusLabel = "販売期間終了";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LPViewTracker productId={product.id} lotId={lot.id} partnerId={product.partner_id ?? undefined} />
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm text-orange-600 hover:text-orange-800"
          >
            &larr; トップページに戻る
          </Link>
        </nav>

        {/* Product image */}
        {product.image_url && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Product info */}
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {product.name}
        </h1>

        {/* 認証バッジ */}
        {showBadge && partner && (
          <div className="mt-3">
            {partner.partner_type === "メーカー" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                認証済みメーカー｜{partner.company_name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                正規代理店｜{partner.company_name}
                {parentPartner && `（${parentPartner.company_name}）`}
              </span>
            )}
          </div>
        )}

        {product.description && (
          <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        )}

        {/* カテゴリ固有情報 */}
        {product.category_template_id && product.custom_fields && Object.keys(product.custom_fields).length > 0 && (() => {
          const tmpl = (CATEGORY_TEMPLATES as Record<string, CategoryTemplate>)[product.category_template_id];
          if (!tmpl) return null;
          const fields = tmpl.product_fields;
          return (
            <div className="mt-6 rounded-xl border bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{tmpl.name} 情報</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {fields.map((f) => {
                  const val = product.custom_fields?.[f.field];
                  if (!val) return null;
                  return (
                    <div key={f.field} className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">{f.label}</span>
                      <span className="font-medium text-gray-900">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* タグバッジ */}
        {productTagList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {productTagList.map((tag) => (
              <Link
                key={tag.id}
                href={`/t/${tag.slug}`}
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-orange-100/60 hover:text-orange-700 transition"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Lot details card */}
        <div className="mt-8 rounded-2xl border-2 border-orange-600 bg-white p-8 shadow-xl">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-gray-900">
              &yen;{formattedPrice}
            </span>
            <span className="text-gray-500">
              /{lot.selling_unit ?? "個"}
              {lot.selling_unit !== "個" && lot.units_per_case && (
                <>（{lot.units_per_case}個入）</>
              )}
              （税込）
            </span>
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between border-b pb-2">
              <span>ロット番号</span>
              <span className="font-medium text-gray-900">{lot.lot_number}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>在庫数</span>
              <span className="font-medium text-gray-900">
                {lot.stock > 0 ? `残り ${lot.stock} ${lot.selling_unit ?? "個"}` : "在庫なし"}
              </span>
            </div>
            {lot.selling_unit && lot.selling_unit !== "個" && (
              <div className="flex justify-between border-b pb-2">
                <span>販売単位</span>
                <span className="font-medium text-gray-900">
                  {lot.selling_unit}
                  {lot.units_per_case && `（${lot.units_per_case}個入）`}
                  {lot.cases_per_pallet && ` / パレット${lot.cases_per_pallet}${lot.selling_unit}`}
                </span>
              </div>
            )}
            {lot.min_order_units > 1 && (
              <div className="flex justify-between border-b pb-2">
                <span>最小注文数</span>
                <span className="font-medium text-gray-900">
                  {lot.min_order_units}{lot.selling_unit ?? "個"}〜
                </span>
              </div>
            )}
            {lot.expiration_date && (
              <div className="flex justify-between border-b pb-2">
                <span>賞味期限</span>
                <span className="font-medium text-gray-900">
                  {lot.expiration_date}
                </span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span>配送</span>
              <span className="font-medium text-gray-900">
                {lot.shipping_method === "メーカー無料"
                  ? "送料無料（メーカー負担）"
                  : lot.shipping_method === "配送会社手配"
                  ? `配送会社手配（送料 ¥${lot.shipping_fee.toLocaleString("ja-JP")}）`
                  : `購入者指定（送料 ¥${lot.shipping_fee.toLocaleString("ja-JP")}）`}
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span>ステータス</span>
              <span
                className={`font-medium ${
                  lot.status === "販売中"
                    ? "text-green-600"
                    : lot.status === "売切れ"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {isExpired ? "期限切れ" : lot.status}
              </span>
            </div>
          </div>

          {hasActiveAuction ? (
            <Link
              href={`/products/${slug}/${lotId}/auction`}
              className="mt-6 block w-full rounded-full bg-orange-50/400 py-4 text-center text-lg font-semibold text-white transition hover:bg-orange-600"
            >
              オークション開催中 →
            </Link>
          ) : canPurchase ? (
            <>
              <LotPurchaseButton
                lotId={lot.id}
                disabled={false}
                statusLabel={statusLabel}
                minOrderUnits={lot.min_order_units}
                maxStock={lot.stock}
                sellingUnit={lot.selling_unit ?? undefined}
              />
              <RecurringPurchaseForm lotId={lot.id} price={price} />
            </>
          ) : (
            <div className="mt-6 space-y-3">
              <button
                disabled
                className="w-full rounded-full bg-gray-300 py-4 text-lg font-semibold text-gray-500 cursor-not-allowed"
              >
                {statusLabel}
              </button>
              <Link
                href={`/products/${slug}/${lotId}/request`}
                className="block w-full rounded-full border-2 border-teal-600 py-3 text-center text-sm font-semibold text-teal-600 transition hover:bg-teal-50"
              >
                入荷リクエストを送る
              </Link>
            </div>
          )}
        </div>

        {/* メーカー・生産者への質問 */}
        {product.partner_id && partner && (
          <QuestionSection
            productId={product.id}
            lotId={lot.id}
            partnerId={product.partner_id}
            partnerName={partner.company_name}
          />
        )}

        {/* 非財務アンケート（感謝・感動・選択理由） */}
        <NonFinancialSurvey productId={product.id} partnerId={product.partner_id ?? undefined} lotId={lot.id} />

        {/* アンケート */}
        <SurveySection targetType="lot" targetId={lot.id} productId={product.id} />

        {/* 掲示板 */}
        <BoardSection targetType="lot" targetId={lot.id} />
      </div>
    </div>
  );
}
