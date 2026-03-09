"use client";

import { CollectionBlockRenderer } from "@/components/creator-lp/CollectionBlockRenderer";
import type { CollectionBlock, CollectionItem, LPTheme, Tag } from "@/lib/types";

type Props = {
  blocks: CollectionBlock[];
  items: CollectionItem[];
  affiliateCode: string;
  allTags: Tag[];
  theme: LPTheme;
  isEmbed?: boolean;
};

export function CollectionPageClient({
  blocks,
  items,
  affiliateCode,
  allTags,
  theme,
  isEmbed,
}: Props) {
  return (
    <CollectionBlockRenderer
      blocks={blocks}
      context={{ items, affiliateCode, allTags, theme, isEmbed }}
    />
  );
}
