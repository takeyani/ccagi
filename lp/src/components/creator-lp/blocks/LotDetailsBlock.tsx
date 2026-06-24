import type { Lot, Product, LPTheme } from "@/lib/types";
import LotPurchaseButton from "@/components/LotPurchaseButton";
import AgeRestrictionBadge from "@/components/AgeRestrictionBadge";

type Props = {
  props: Record<string, unknown>;
  lot: Lot;
  product: Product;
  theme: LPTheme;
  ageVerified?: boolean;
};

export function LotDetailsBlock({ props, lot, product, theme, ageVerified = false }: Props) {
  const showPrice = props.show_price !== false;
  const showStock = props.show_stock !== false;
  const showExpiry = props.show_expiry !== false;
  const showPurchaseButton = props.show_purchase_button !== false;

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
    <section id="lot_details" className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <div
        className="rounded-2xl border-2 bg-white p-5 shadow-xl sm:p-8"
        style={{ borderColor: theme.primary_color || "#6366f1" }}
      >
        {showPrice && (
          <div className="flex flex-wrap items-baseline justify-center gap-x-1">
            <span className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              &yen;{formattedPrice}
            </span>
            <span className="text-xs text-gray-500 sm:text-sm">（税込）</span>
          </div>
        )}

        <dl className="mt-5 space-y-2 text-sm text-gray-600 sm:mt-6">
          <div className="flex justify-between gap-3 border-b pb-2">
            <dt className="flex-shrink-0">商品ロット番号</dt>
            <dd className="font-medium text-gray-900 text-right break-all">{lot.lot_number}</dd>
          </div>
          {showStock && (
            <div className="flex justify-between gap-3 border-b pb-2">
              <dt className="flex-shrink-0">残り在庫</dt>
              <dd className="font-medium text-gray-900 text-right">
                {lot.stock > 0 ? `あと ${lot.stock} 個` : "在庫なし"}
              </dd>
            </div>
          )}
          {showExpiry && lot.expiration_date && (
            <div className="flex justify-between gap-3 border-b pb-2">
              <dt className="flex-shrink-0">賞味期限</dt>
              <dd className="font-medium text-gray-900 text-right">
                {lot.expiration_date} まで
              </dd>
            </div>
          )}
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

        {product.age_restricted && (
          <AgeRestrictionBadge restrictionType={product.restriction_type} />
        )}

        {showPurchaseButton && (
          <LotPurchaseButton
            lotId={lot.id}
            disabled={!canPurchase}
            statusLabel={statusLabel}
            minOrderUnits={lot.min_order_units}
            maxStock={lot.stock}
            sellingUnit={lot.selling_unit ?? undefined}
            ageRestricted={product.age_restricted}
            restrictionType={product.restriction_type}
            ageVerified={ageVerified}
          />
        )}
      </div>
    </section>
  );
}
