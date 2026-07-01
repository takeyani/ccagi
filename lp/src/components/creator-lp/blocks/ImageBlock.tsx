type Props = {
  props: Record<string, unknown>;
};

const MAX_WIDTH_CLASS: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-full",
};

const ROUNDED_CLASS: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export function ImageBlock({ props }: Props) {
  const imageUrl = props.image_url as string;
  const altText = (props.alt_text as string) || "";
  const caption = props.caption as string;
  const linkUrl = (props.link_url as string) || "";
  const maxWidth = (props.max_width as string) || "3xl";
  const rounded = (props.rounded as string) || "xl";

  if (!imageUrl) return null;

  const widthClass = MAX_WIDTH_CLASS[maxWidth] ?? "max-w-3xl";
  const roundedClass = ROUNDED_CLASS[rounded] ?? "rounded-xl";

  const img = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={imageUrl}
      alt={altText}
      className={`h-auto w-full ${roundedClass} object-cover`}
    />
  );

  return (
    <section className={`mx-auto ${widthClass} px-6 py-8`}>
      <figure>
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {img}
          </a>
        ) : (
          img
        )}
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-gray-500">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
