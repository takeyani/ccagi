import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { Product, Lot } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string; lotId: string }>;
};

async function submitRequest(formData: FormData) {
  "use server";
  const lotId = formData.get("lot_id") as string;
  const productId = formData.get("product_id") as string;
  const slug = formData.get("slug") as string;

  // 商品の注文条件を取得してバリデーション
  const { data: prod } = await getSupabase()
    .from("products")
    .select("min_order_quantity, min_order_amount")
    .eq("id", productId)
    .single();

  const quantity = formData.get("quantity") ? Number(formData.get("quantity")) : null;
  const preferredPrice = formData.get("preferred_price")
    ? Number(formData.get("preferred_price"))
    : null;

  if (prod?.min_order_quantity && quantity != null && quantity < prod.min_order_quantity) {
    throw new Error(`最小注文数量は${prod.min_order_quantity}個以上です`);
  }

  if (prod?.min_order_amount && preferredPrice != null && preferredPrice < prod.min_order_amount) {
    throw new Error(`最小注文金額は¥${prod.min_order_amount.toLocaleString()}以上です`);
  }

  const { error } = await getSupabase().from("stock_requests").insert({
    lot_id: lotId,
    product_id: productId,
    requester_name: formData.get("requester_name") as string,
    requester_email: formData.get("requester_email") as string,
    quantity,
    preferred_price: preferredPrice,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw new Error(error.message);
  redirect(`/products/${slug}/${lotId}?requested=1`);
}

export default async function StockRequestPage({ params }: Props) {
  const { slug, lotId } = await params;

  const { data: product } = await getSupabase()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Product>();

  if (!product) notFound();

  const { data: lot } = await getSupabase()
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .eq("product_id", product.id)
    .single<Lot>();

  if (!lot) notFound();

  const price = lot.price ?? product.base_price;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-6 py-16">
        <nav className="mb-8">
          <Link
            href={`/products/${slug}/${lotId}`}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; 商品ページに戻る
          </Link>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          入荷リクエスト
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {product.name}（ロット: {lot.lot_number}）の入荷をリクエストします。
          在庫が確保でき次第、メールでご連絡いたします。
        </p>

        {/* メーカー側の注文条件 */}
        {(product.min_order_quantity || product.min_order_amount || product.order_notes) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm">
            <p className="font-medium text-amber-800 mb-2">注文条件</p>
            <ul className="space-y-1 text-amber-700">
              {product.min_order_quantity && product.min_order_quantity > 1 && (
                <li>最小注文数量: {product.min_order_quantity} 個以上</li>
              )}
              {product.min_order_amount && (
                <li>最小注文金額: &yen;{product.min_order_amount.toLocaleString()} 以上</li>
              )}
              {product.order_notes && <li>{product.order_notes}</li>}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <form action={submitRequest} className="space-y-4">
            <input type="hidden" name="lot_id" value={lotId} />
            <input type="hidden" name="product_id" value={product.id} />
            <input type="hidden" name="slug" value={slug} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                name="requester_name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="山田太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                name="requester_email"
                type="email"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="taro@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望数量
                {product.min_order_quantity && product.min_order_quantity > 1 && (
                  <span className="text-xs text-gray-400 ml-1">
                    （{product.min_order_quantity}個以上）
                  </span>
                )}
              </label>
              <input
                name="quantity"
                type="number"
                min={product.min_order_quantity ?? 1}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder={String(product.min_order_quantity ?? 1)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望価格
                {product.min_order_amount && (
                  <span className="text-xs text-gray-400 ml-1">
                    （&yen;{product.min_order_amount.toLocaleString()}以上）
                  </span>
                )}
              </label>
              <input
                name="preferred_price"
                type="number"
                min={product.min_order_amount ?? 0}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder={`¥${(product.min_order_amount ?? price).toLocaleString()}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="納期の希望やその他の要望"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700"
            >
              リクエストを送信
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
