import type { Product, Partner, Tag } from "@/lib/types";

type Props = {
  props: Record<string, unknown>;
  product: Product;
  partner: Partner | null;
  tags: Tag[];
};

export function ProductInfoBlock({ props, product, partner, tags }: Props) {
  const showImage = props.show_image !== false;
  const showDescription = props.show_description !== false;
  const showTags = props.show_tags !== false;
  const showBadge = props.show_badge !== false;

  const isCertified = partner?.certification_status === "認証済み";

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      {showImage && product.image_url && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>

      {showBadge && isCertified && partner && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {partner.partner_type === "メーカー"
              ? `認証済みメーカー｜${partner.company_name}`
              : `正規代理店｜${partner.company_name}`}
          </span>
        </div>
      )}

      {showDescription && product.description && (
        <p className="mt-4 leading-relaxed text-gray-600 whitespace-pre-wrap">
          {product.description}
        </p>
      )}

      {showTags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
