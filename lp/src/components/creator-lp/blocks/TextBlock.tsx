type Props = {
  props: Record<string, unknown>;
};

export function TextBlock({ props }: Props) {
  const content = (props.content as string) || "";
  const alignment = (props.alignment as string) || "left";

  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <div
        className="prose prose-gray max-w-none whitespace-pre-wrap leading-relaxed text-gray-700"
        style={{ textAlign: alignment as React.CSSProperties["textAlign"] }}
      >
        {content}
      </div>
    </section>
  );
}
