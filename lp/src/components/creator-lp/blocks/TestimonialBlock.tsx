import type { LPTheme } from "@/lib/types";

type Props = {
  props: Record<string, unknown>;
  theme: LPTheme;
};

export function TestimonialBlock({ props, theme }: Props) {
  const quote = (props.quote as string) || "";
  const authorName = (props.author_name as string) || "";
  const authorTitle = (props.author_title as string) || "";

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: `${theme.primary_color || "#6366f1"}10` }}
      >
        <svg
          className="mx-auto h-8 w-8 opacity-30"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ color: theme.primary_color || "#6366f1" }}
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <blockquote className="mt-4 text-lg leading-relaxed text-gray-700 italic">
          {quote}
        </blockquote>
        <div className="mt-6">
          <p className="font-semibold text-gray-900">{authorName}</p>
          {authorTitle && (
            <p className="text-sm text-gray-500">{authorTitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}
