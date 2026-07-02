type GalleryItem = {
  image_url?: string;
  alt_text?: string;
  caption?: string;
  link_url?: string;
};

type Props = {
  props: Record<string, unknown>;
};

const GAP_CLASS: Record<string, string> = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-6",
};

const COL_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export function GalleryBlock({ props }: Props) {
  const items = (props.items as GalleryItem[] | undefined) ?? [];
  const columns = Number(props.columns) || 3;
  const gap = (props.gap as string) || "md";
  const heading = (props.heading as string) || "";

  const validItems = items.filter((it) => it.image_url);

  if (validItems.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-400">
          ギャラリー画像が設定されていません
        </div>
      </section>
    );
  }

  const gapClass = GAP_CLASS[gap] ?? "gap-3";
  const colClass = COL_CLASS[columns] ?? "grid-cols-2 sm:grid-cols-3";

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      {heading && (
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {heading}
        </h2>
      )}
      <div className={`grid ${colClass} ${gapClass}`}>
        {validItems.map((item, i) => {
          const img = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.image_url as string}
              alt={item.alt_text || ""}
              className="aspect-square w-full rounded-lg object-cover transition group-hover:opacity-90"
            />
          );
          return (
            <figure key={i} className="group">
              {item.link_url ? (
                <a href={item.link_url} target="_blank" rel="noopener noreferrer">
                  {img}
                </a>
              ) : (
                img
              )}
              {item.caption && (
                <figcaption className="mt-1.5 text-center text-xs text-gray-500">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
