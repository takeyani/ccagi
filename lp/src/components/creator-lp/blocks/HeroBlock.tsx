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
  const bgVideoUrl = props.bg_video_url as string;
  const bgVideoPoster = props.bg_video_poster as string;
  const overlayOpacity = typeof props.overlay_opacity === "number" ? props.overlay_opacity : 0.4;
  const title = (props.title as string) || "";
  const subtitle = (props.subtitle as string) || "";
  const ctaText = (props.cta_text as string) || "";

  const isImage = bgType === "image" && bgImageUrl;
  const isVideo = bgType === "video" && bgVideoUrl;

  const bgStyle: React.CSSProperties = isImage
    ? {
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : isVideo
    ? {}
    : {
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      };

  return (
    <section className="relative overflow-hidden" style={bgStyle}>
      {isVideo && (
        <video
          src={bgVideoUrl}
          poster={bgVideoPoster || undefined}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {(isImage || isVideo) && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
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
