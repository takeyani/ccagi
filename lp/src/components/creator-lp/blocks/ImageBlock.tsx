type Props = {
  props: Record<string, unknown>;
};

export function ImageBlock({ props }: Props) {
  const imageUrl = props.image_url as string;
  const altText = (props.alt_text as string) || "";
  const caption = props.caption as string;

  if (!imageUrl) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText}
          className="h-auto w-full rounded-xl object-cover"
        />
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-gray-500">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
