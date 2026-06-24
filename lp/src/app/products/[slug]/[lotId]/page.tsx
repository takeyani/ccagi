import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import LotPurchaseButton from "@/components/LotPurchaseButton";
import RecurringPurchaseForm from "@/components/RecurringPurchaseForm";
import AgeRestrictionBadge from "@/components/AgeRestrictionBadge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // 年齢確認状態の取得（年齢制限商品の場合のみ）
  let ageVerified = false;
  if (product.age_restricted) {
    try {
      const authed = await createSupabaseServerClient();
      const { data: { user } } = await authed.auth.getUser();
      if (user) {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("user_profiles")
          .select("age_verified_at")
          .eq("id", user.id)
          .maybeSingle();
        ageVerified = !!profile?.age_verified_at;
      }
    } catch {
      // セッション未取得時は未確認扱い
    }
  }

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
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-16">
        {/* Header */}
        <nav className="mb-4 sm:mb-8">
          <Link
            href="/"
            className="text-sm text-orange-600 hover:text-orange-800"
          >
            &larr; トップページに戻る
          </Link>
        </nav>

        {/* Product image */}
        {product.image_url && (
          <div className="mb-5 overflow-hidden rounded-xl sm:mb-8 sm:rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Product info */}
        <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl break-words">
          {product.name}
        </h1>

        {/* 認証バッジ */}
        {showBadge && partner && (
          <div className="mt-3">
            {partner.partner_type === "メーカー" ? (
              <span className="inline-flex items-start gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs sm:text-sm font-medium text-green-800 break-words">
                <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>認証済みメーカー｜{partner.company_name}</span>
              </span>
            ) : (
              <span className="inline-flex items-start gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs sm:text-sm font-medium text-blue-800 break-words">
                <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>
                  正規代理店｜{partner.company_name}
                  {parentPartner && `（${parentPartner.company_name}）`}
                </span>
              </span>
            )}
          </div>
        )}

        {product.description && (
          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        )}

        {/* カテゴリ固有情報 */}
        {product.category_template_id && product.custom_fields && Object.keys(product.custom_fields).length > 0 && (() => {
          const tmpl = (CATEGORY_TEMPLATES as Record<string, CategoryTemplate>)[product.category_template_id];
          if (!tmpl) return null;
          const fields = tmpl.product_fields;
          return (
            <div className="mt-6 rounded-xl border bg-white p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{tmpl.name} 情報</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {fields.map((f) => {
                  const val = product.custom_fields?.[f.field];
                  if (!val) return null;
                  return (
                    <div key={f.field} className="flex justify-between gap-2 border-b pb-1">
                      <span className="text-gray-500 flex-shrink-0">{f.label}</span>
                      <span className="font-medium text-gray-900 text-right break-words">{String(val)}</span>
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
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-orange-100/60 hover:text-orange-700 transition"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Lot details card */}
        <div className="mt-6 rounded-2xl border-2 border-orange-600 bg-white p-5 shadow-xl sm:mt-8 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-center gap-x-1">
            <span className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              &yen;{formattedPrice}
            </span>
            <span className="text-xs text-gray-500 sm:text-sm">
              / {lot.selling_unit ?? "個"}
              {lot.selling_unit !== "個" && lot.units_per_case && (
                <>（{lot.units_per_case}個入）</>
              )}
              <span className="ml-1">（税込）</span>
            </span>
          </div>

          <dl className="mt-5 space-y-2 text-sm text-gray-600 sm:mt-6">
            <div className="flex justify-between gap-3 border-b pb-2">
              <dt className="flex-shrink-0">商品ロット番号</dt>
              <dd className="font-medium text-gray-900 text-right break-all">{lot.lot_number}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b pb-2">
              <dt className="flex-shrink-0">残り在庫</dt>
              <dd className="font-medium text-gray-900 text-right">
                {lot.stock > 0 ? `あと ${lot.stock} ${lot.selling_unit ?? "個"}` : "在庫なし"}
              </dd>
            </div>
            {lot.selling_unit && lot.selling_unit !== "個" && (
              <div className="flex justify-between gap-3 border-b pb-2">
                <dt className="flex-shrink-0">販売単位</dt>
                <dd className="font-medium text-gray-900 text-right">
                  1{lot.selling_unit}単位で販売
                  {lot.units_per_case && `（${lot.units_per_case}個入）`}
                  {lot.cases_per_pallet && ` / パレット${lot.cases_per_pallet}${lot.selling_unit}`}
                </dd>
              </div>
            )}
            {lot.min_order_units > 1 && (
              <div className="flex justify-between gap-3 border-b pb-2">
                <dt className="flex-shrink-0">最小注文数</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {lot.min_order_units}{lot.selling_unit ?? "個"}以上から
                </dd>
              </div>
            )}
            {lot.expiration_date && (
              <div className="flex justify-between gap-3 border-b pb-2">
                <dt className="flex-shrink-0">賞味期限</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {lot.expiration_date} まで
                </dd>
              </div>
            )}
            <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:justify-between sm:gap-3">
              <dt className="flex-shrink-0">配送</dt>
              <dd className="font-medium text-gray-900 sm:text-right break-words">
                {lot.shipping_method === "メーカー無料"
                  ? "送料無料（メーカー負担）"
                  : lot.shipping_method === "配送会社手配"
                  ? `配送業者がお届け（送料 ¥${lot.shipping_fee.toLocaleString("ja-JP")}）`
                  : `お客様指定の配送方法（送料 ¥${lot.shipping_fee.toLocaleString("ja-JP")}）`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 pb-2">
              <dt className="flex-shrink-0">販売状況</dt>
              <dd
                className={`font-medium text-right ${
                  lot.status === "販売中"
                    ? "text-green-600"
                    : lot.status === "売切れ"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {isExpired ? "販売終了（期限切れ）" : lot.status}
              </dd>
            </div>
          </dl>

          {hasActiveAuction ? (
            <Link
              href={`/products/${slug}/${lotId}/auction`}
              className="mt-6 block w-full rounded-full bg-orange-50/400 py-4 text-center text-lg font-semibold text-white transition hover:bg-orange-600"
            >
              オークション開催中 →
            </Link>
          ) : canPurchase ? (
            <>
              <AgeRestrictionBadge restrictionType={product.age_restricted ? product.restriction_type : null} />
              <LotPurchaseButton
                lotId={lot.id}
                disabled={false}
                statusLabel={statusLabel}
                minOrderUnits={lot.min_order_units}
                maxStock={lot.stock}
                sellingUnit={lot.selling_unit ?? undefined}
                ageRestricted={product.age_restricted}
                restrictionType={product.restriction_type}
                ageVerified={ageVerified}
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
