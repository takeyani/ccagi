import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { Tag, Product, Lot } from "@/lib/types";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: tag } = await getSupabase()
    .from("tags")
    .select("name, description, tag_type")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!tag) return { title: "タグが見つかりません" };

  return {
    title: `${tag.name}の商品一覧`,
    description: tag.description || `${tag.tag_type}「${tag.name}」に関連する商品をご覧いただけます。`,
  };
}

export default async function TagDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: tag } = await getSupabase()
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Tag>();

  if (!tag) notFound();

  // タグに紐づく商品を取得
  const { data: productTags } = await getSupabase()
    .from("product_tags")
    .select("product_id")
    .eq("tag_id", tag.id);

  const productIds = (productTags ?? []).map(
    (pt: { product_id: string }) => pt.product_id
  );

  let products: (Product & {
    partners: { company_name: string } | null;
  })[] = [];

  if (productIds.length > 0) {
    const { data } = await getSupabase()
      .from("products")
      .select("*, partners(company_name)")
      .in("id", productIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    products = (data ?? []) as typeof products;
  }

  // 各商品のロット情報を取得
  const allProductIds = products.map((p) => p.id);
  let lotsMap: Record<string, Lot[]> = {};

  if (allProductIds.length > 0) {
    const { data: lots } = await getSupabase()
      .from("lots")
      .select("*")
      .in("product_id", allProductIds)
      .eq("status", "販売中")
      .order("created_at", { ascending: false });

    lotsMap = (lots ?? []).reduce(
      (acc: Record<string, Lot[]>, lot: Lot) => {
        if (!acc[lot.product_id]) acc[lot.product_id] = [];
        acc[lot.product_id].push(lot);
        return acc;
      },
      {}
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* パンくず */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/t" className="text-indigo-600 hover:text-indigo-800">
            タグ一覧
          </Link>
          <span>/</span>
          <span className="text-gray-800">{tag.name}</span>
        </nav>

        {/* タグヘッダ */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
              {tag.tag_type}
            </span>
            <h1 className="text-3xl font-bold text-gray-900">{tag.name}</h1>
          </div>
          {tag.description && (
            <p className="text-gray-600 leading-relaxed">{tag.description}</p>
          )}
        </div>

        {/* 商品カードグリッド */}
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-16">
            このタグに該当する商品はまだありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const lots = lotsMap[product.id] ?? [];
              const prices = lots
                .map((l) => l.price ?? product.base_price)
                .concat(lots.length === 0 ? [product.base_price] : []);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  {product.image_url && (
                    <div className="h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    {product.partners && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {product.partners.company_name}
                      </p>
                    )}
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {minPrice === maxPrice
                        ? `\u00A5${minPrice.toLocaleString()}`
                        : `\u00A5${minPrice.toLocaleString()} ~ \u00A5${maxPrice.toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      販売中ロット: {lots.length}件
                    </p>

                    {/* ロットLPリンク（最大3件） */}
                    {lots.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {lots.slice(0, 3).map((lot) => (
                          <Link
                            key={lot.id}
                            href={`/products/${product.slug}/${lot.id}`}
                            className="inline-block rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            {lot.lot_number}
                          </Link>
                        ))}
                        {lots.length > 3 && (
                          <span className="text-xs text-gray-400 py-1">
                            +{lots.length - 3}件
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
