"use client";

import { useState } from "react";
import type { CollectionBlock, LPTheme, CollectionItem, Tag } from "@/lib/types";
import { HeroBlock } from "./blocks/HeroBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { TextBlock } from "./blocks/TextBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { TestimonialBlock } from "./blocks/TestimonialBlock";
import { FAQBlock } from "./blocks/FAQBlock";
import { CTABlock } from "./blocks/CTABlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { CollectionGridBlock } from "./blocks/CollectionGridBlock";
import { CollectionFilterBarBlock } from "./blocks/CollectionFilterBarBlock";

type CollectionContext = {
  items: CollectionItem[];
  affiliateCode: string;
  allTags: Tag[];
  theme: LPTheme;
  isEmbed?: boolean;
};

export function CollectionBlockRenderer({
  blocks,
  context,
}: {
  blocks: CollectionBlock[];
  context: CollectionContext;
}) {
  const [filteredItems, setFilteredItems] = useState<CollectionItem[]>(context.items);

  return (
    <div
      style={{
        backgroundColor: context.theme.bg_color || "#ffffff",
        fontFamily: context.theme.font || "inherit",
      }}
    >
      {blocks.map((block) => (
        <CollectionBlockItem
          key={block.id}
          block={block}
          context={context}
          filteredItems={filteredItems}
          onFilter={setFilteredItems}
        />
      ))}
    </div>
  );
}

function CollectionBlockItem({
  block,
  context,
  filteredItems,
  onFilter,
}: {
  block: CollectionBlock;
  context: CollectionContext;
  filteredItems: CollectionItem[];
  onFilter: (items: CollectionItem[]) => void;
}) {
  const { theme } = context;

  switch (block.type) {
    case "hero":
      return <HeroBlock props={block.props} theme={theme} />;
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
    case "collection_grid":
      return (
        <CollectionGridBlock
          props={block.props}
          items={filteredItems}
          affiliateCode={context.affiliateCode}
          theme={theme}
          isEmbed={context.isEmbed}
        />
      );
    case "collection_filter_bar":
      return (
        <CollectionFilterBarBlock
          props={block.props}
          items={context.items}
          allTags={context.allTags}
          onFilter={onFilter}
        />
      );
    default:
      return null;
  }
}
