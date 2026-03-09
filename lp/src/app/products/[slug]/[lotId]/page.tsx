import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import LotPurchaseButton from "@/components/LotPurchaseButton";
import { SurveySection } from "@/components/surveys/SurveySection";
import { BoardSection } from "@/components/boards/BoardSection";
import type { Product, Lot, Partner, Auction, Tag } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string; lotId: string }>;
};

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
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-800"
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

        {/* タグバッジ */}
        {productTagList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {productTagList.map((tag) => (
              <Link
                key={tag.id}
                href={`/t/${tag.slug}`}
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Lot details card */}
        <div className="mt-8 rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-xl">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-gray-900">
              &yen;{formattedPrice}
            </span>
            <span className="text-gray-500">（税込）</span>
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between border-b pb-2">
              <span>ロット番号</span>
              <span className="font-medium text-gray-900">{lot.lot_number}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>在庫数</span>
              <span className="font-medium text-gray-900">
                {lot.stock > 0 ? `残り ${lot.stock} 個` : "在庫なし"}
              </span>
            </div>
            {lot.expiration_date && (
              <div className="flex justify-between border-b pb-2">
                <span>賞味期限</span>
                <span className="font-medium text-gray-900">
                  {lot.expiration_date}
                </span>
              </div>
            )}
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
              className="mt-6 block w-full rounded-full bg-orange-500 py-4 text-center text-lg font-semibold text-white transition hover:bg-orange-600"
            >
              オークション開催中 →
            </Link>
          ) : canPurchase ? (
            <LotPurchaseButton
              lotId={lot.id}
              disabled={false}
              statusLabel={statusLabel}
            />
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

        {/* アンケート */}
        <SurveySection targetType="lot" targetId={lot.id} productId={product.id} />

        {/* 掲示板 */}
        <BoardSection targetType="lot" targetId={lot.id} />
      </div>
    </div>
  );
}
