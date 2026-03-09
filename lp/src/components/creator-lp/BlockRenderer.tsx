import type { LPBlock, LPTheme, Product, Lot, Partner, Tag } from "@/lib/types";
import { HeroBlock } from "./blocks/HeroBlock";
import { ProductInfoBlock } from "./blocks/ProductInfoBlock";
import { LotDetailsBlock } from "./blocks/LotDetailsBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { TextBlock } from "./blocks/TextBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { TestimonialBlock } from "./blocks/TestimonialBlock";
import { FAQBlock } from "./blocks/FAQBlock";
import { CTABlock } from "./blocks/CTABlock";
import { DividerBlock } from "./blocks/DividerBlock";

type BlockContext = {
  product: Product;
  lot: Lot;
  partner: Partner | null;
  tags: Tag[];
  theme: LPTheme;
};

export function BlockRenderer({
  blocks,
  context,
}: {
  blocks: LPBlock[];
  context: BlockContext;
}) {
  return (
    <div
      style={{
        backgroundColor: context.theme.bg_color || "#ffffff",
        fontFamily: context.theme.font || "inherit",
      }}
    >
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} context={context} />
      ))}
    </div>
  );
}

function BlockItem({ block, context }: { block: LPBlock; context: BlockContext }) {
  const { theme } = context;

  switch (block.type) {
    case "hero":
      return <HeroBlock props={block.props} theme={theme} />;
    case "product_info":
      return (
        <ProductInfoBlock
          props={block.props}
          product={context.product}
          partner={context.partner}
          tags={context.tags}
        />
      );
    case "lot_details":
      return (
        <LotDetailsBlock
          props={block.props}
          lot={context.lot}
          product={context.product}
          theme={theme}
        />
      );
    case "image":
      return <ImageBlock props={block.props} />;
    case "text":
      return <TextBlock props={block.props} />;
    case "features":
      return <FeaturesBlock props={block.props} theme={theme} />;
    case "testimonial":
      return <TestimonialBlock props={block.props} theme={theme} />;
    case "faq":
      return <FAQBlock props={block.props} />;
    case "cta":
      return <CTABlock props={block.props} theme={theme} />;
    case "divider":
      return <DividerBlock props={block.props} />;
    default:
      return null;
  }
}
