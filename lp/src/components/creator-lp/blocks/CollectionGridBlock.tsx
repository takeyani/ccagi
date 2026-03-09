import type { CollectionItem, LPTheme } from "@/lib/types";
import { ProductCard } from "./ProductCard";

type Props = {
  props: Record<string, unknown>;
  items: CollectionItem[];
  affiliateCode: string;
  theme: LPTheme;
  isEmbed?: boolean;
};

export function CollectionGridBlock({ props, items, affiliateCode, isEmbed }: Props) {
  const columns = (props.columns as number) || 3;
  const showPrice = props.show_price !== false;
  const showPartner = props.show_partner !== false;
  const showTags = props.show_tags !== false;
  const cardStyle = (props.card_style as string) || "card";
  const sortBy = (props.sort_by as string) || "name";
  const maxItems = (props.max_items as number) || 0;

  // Sort items
  let sorted = [...items];
  switch (sortBy) {
    case "price_asc":
      sorted.sort((a, b) => {
        const pa = a.lots.reduce((m, l) => (l.price && l.price < m ? l.price : m), Infinity);
        const pb = b.lots.reduce((m, l) => (l.price && l.price < m ? l.price : m), Infinity);
        return pa - pb;
      });
      break;
    case "price_desc":
      sorted.sort((a, b) => {
        const pa = a.lots.reduce((m, l) => (l.price && l.price < m ? l.price : m), Infinity);
        const pb = b.lots.reduce((m, l) => (l.price && l.price < m ? l.price : m), Infinity);
        return pb - pa;
      });
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.product.created_at).getTime() - new Date(a.product.created_at).getTime()
      );
      break;
    default:
      sorted.sort((a, b) => a.product.name.localeCompare(b.product.name));
  }

  if (maxItems > 0) {
    sorted = sorted.slice(0, maxItems);
  }

  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="collection_grid" className="mx-auto max-w-6xl px-6 py-12">
      {sorted.length === 0 ? (
        <p className="text-center text-gray-400 py-12">該当する商品がありません</p>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {sorted.map((item) => (
            <ProductCard
              key={item.product.id}
              item={item}
              affiliateCode={affiliateCode}
              showPrice={showPrice}
              showPartner={showPartner}
              showTags={showTags}
              cardStyle={cardStyle}
              isEmbed={isEmbed}
            />
          ))}
        </div>
      )}
    </section>
  );
}
