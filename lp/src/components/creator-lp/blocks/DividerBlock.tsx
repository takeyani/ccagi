type Props = {
  props: Record<string, unknown>;
};

export function DividerBlock({ props }: Props) {
  const style = (props.style as string) || "line";
  const spacing = (props.spacing as string) || "md";

  const paddingMap: Record<string, string> = {
    sm: "py-4",
    md: "py-8",
    lg: "py-12",
  };

  return (
    <div className={`mx-auto max-w-3xl px-6 ${paddingMap[spacing] || "py-8"}`}>
      {style === "dots" ? (
        <div className="flex justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        </div>
      ) : style === "space" ? (
        <div />
      ) : (
        <hr className="border-gray-200" />
      )}
    </div>
  );
}
