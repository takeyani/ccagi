import type { Lot, Product, LPTheme } from "@/lib/types";
import LotPurchaseButton from "@/components/LotPurchaseButton";

type Props = {
  props: Record<string, unknown>;
  lot: Lot;
  product: Product;
  theme: LPTheme;
};

export function LotDetailsBlock({ props, lot, product, theme }: Props) {
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
    <section id="lot_details" className="mx-auto max-w-xl px-6 py-12">
      <div
        className="rounded-2xl border-2 bg-white p-8 shadow-xl"
        style={{ borderColor: theme.primary_color || "#6366f1" }}
      >
        {showPrice && (
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-gray-900">
              &yen;{formattedPrice}
            </span>
            <span className="text-gray-500">（税込）</span>
          </div>
        )}

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between border-b pb-2">
            <span>ロット番号</span>
            <span className="font-medium text-gray-900">{lot.lot_number}</span>
          </div>
          {showStock && (
            <div className="flex justify-between border-b pb-2">
              <span>在庫数</span>
              <span className="font-medium text-gray-900">
                {lot.stock > 0 ? `残り ${lot.stock} 個` : "在庫なし"}
              </span>
            </div>
          )}
          {showExpiry && lot.expiration_date && (
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

        {showPurchaseButton && (
          <LotPurchaseButton
            lotId={lot.id}
            disabled={!canPurchase}
            statusLabel={statusLabel}
          />
        )}
      </div>
    </section>
  );
}
