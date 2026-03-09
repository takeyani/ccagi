import Link from "next/link";
import type { CollectionItem } from "@/lib/types";

type Props = {
  item: CollectionItem;
  affiliateCode: string;
  showPrice: boolean;
  showPartner: boolean;
  showTags: boolean;
  cardStyle: string;
  isEmbed?: boolean;
};

export function ProductCard({
  item,
  affiliateCode,
  showPrice,
  showPartner,
  showTags,
  cardStyle,
  isEmbed,
}: Props) {
  const { product, lots, partner, tags, creatorDesigns } = item;

  // If creator has a published LP for this product, link to it; otherwise link to product page
  const firstDesign = creatorDesigns[0];
  const firstLot = lots[0];
  const href = firstDesign && firstLot
    ? isEmbed
      ? `/embed/lp/${affiliateCode}/${firstDesign.slug}/${firstLot.id}`
      : `/c/${affiliateCode}/${firstDesign.slug}/${firstLot.id}`
    : `/products/${product.slug}`;

  const lowestPrice = lots
    .filter((l) => l.price !== null)
    .reduce((min, l) => (l.price! < min ? l.price! : min), Infinity);
  const hasPrice = lowestPrice !== Infinity;

  const isCompact = cardStyle === "compact";

  return (
    <Link
      href={href}
      className={`group block overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg ${
        isCompact ? "" : "shadow-sm"
      }`}
    >
      {/* Image */}
      {product.image_url ? (
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-square items-center justify-center bg-gray-100 text-4xl text-gray-300">
          📦
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>

        {showPrice && hasPrice && (
          <p className="mt-1 text-lg font-bold text-indigo-600">
            ¥{lowestPrice.toLocaleString()}
            {lots.length > 1 && <span className="text-sm font-normal text-gray-500">〜</span>}
          </p>
        )}

        {showPartner && partner && (
          <p className="mt-1 text-xs text-gray-500">{partner.company_name}</p>
        )}

        {showTags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
