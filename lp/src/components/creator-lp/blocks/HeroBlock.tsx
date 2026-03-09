import type { LPTheme } from "@/lib/types";

type Props = {
  props: Record<string, unknown>;
  theme: LPTheme;
};

export function HeroBlock({ props, theme }: Props) {
  const bgType = (props.bg_type as string) || "gradient";
  const gradientFrom = (props.gradient_from as string) || theme.primary_color || "#6366f1";
  const gradientTo = (props.gradient_to as string) || theme.secondary_color || "#8b5cf6";
  const bgImageUrl = props.bg_image_url as string;
  const title = (props.title as string) || "";
  const subtitle = (props.subtitle as string) || "";
  const ctaText = (props.cta_text as string) || "";

  const bgStyle: React.CSSProperties =
    bgType === "image" && bgImageUrl
      ? {
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        };

  return (
    <section className="relative" style={bgStyle}>
      {bgType === "image" && bgImageUrl && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg opacity-90 sm:text-xl">{subtitle}</p>
        )}
        {ctaText && (
          <a
            href="#lot_details"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-gray-900 shadow-lg transition hover:shadow-xl"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
