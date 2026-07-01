type Props = {
  props: Record<string, unknown>;
};

// YouTube / Vimeo URL を判別して埋め込み URL に変換する
function toEmbedUrl(url: string): { platform: "youtube" | "vimeo" | "file"; src: string } | null {
  if (!url) return null;

  // YouTube: youtube.com/watch?v=ID / youtu.be/ID / youtube.com/shorts/ID / youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch) {
    return { platform: "youtube", src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo: vimeo.com/ID / player.vimeo.com/video/ID
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { platform: "vimeo", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // 直接動画ファイル (.mp4 / .webm / .mov / .ogg) or その他URL
  return { platform: "file", src: url };
}

export function VideoBlock({ props }: Props) {
  const videoUrl = (props.video_url as string) || "";
  const poster = (props.poster as string) || undefined;
  const caption = (props.caption as string) || "";
  const autoplay = props.autoplay === true;
  const loop = props.loop === true;
  const muted = props.muted !== false;   // 既定でミュート（autoplayが動きやすいように）
  const controls = props.controls !== false;
  const maxWidth = (props.max_width as string) || "3xl"; // sm/md/lg/xl/2xl/3xl/4xl/full

  const embed = toEmbedUrl(videoUrl);
  if (!embed) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-400">
          動画URLが設定されていません
        </div>
      </section>
    );
  }

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  }[maxWidth] || "max-w-3xl";

  return (
    <section className={`mx-auto ${maxWidthClass} px-6 py-8`}>
      <figure>
        <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "16 / 9" }}>
          {embed.platform === "file" ? (
            <video
              src={embed.src}
              poster={poster}
              autoPlay={autoplay}
              loop={loop}
              muted={muted}
              controls={controls}
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            >
              お使いのブラウザは video タグをサポートしていません。
            </video>
          ) : (
            <iframe
              src={
                embed.src +
                (autoplay ? (embed.src.includes("?") ? "&" : "?") + "autoplay=1&mute=1" : "") +
                (loop ? "&loop=1" : "")
              }
              title="動画"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          )}
        </div>
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-gray-500">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
