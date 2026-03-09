import type { LPTheme } from "@/lib/types";

type FeatureItem = {
  icon: string;
  title: string;
  description: string;
};

type Props = {
  props: Record<string, unknown>;
  theme: LPTheme;
};

export function FeaturesBlock({ props, theme }: Props) {
  const heading = (props.heading as string) || "";
  const items = (props.items as FeatureItem[]) || [];
  const columns = (props.columns as number) || 3;

  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      {heading && (
        <h2
          className="mb-8 text-center text-2xl font-bold"
          style={{ color: theme.primary_color || "#111827" }}
        >
          {heading}
        </h2>
      )}
      <div className={`grid ${gridCols} gap-6`}>
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl bg-white p-6 text-center shadow-sm border"
          >
            <div className="text-3xl">{item.icon}</div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
