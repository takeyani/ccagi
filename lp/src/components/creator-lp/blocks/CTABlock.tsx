"use client";

import type { LPTheme } from "@/lib/types";

type Props = {
  props: Record<string, unknown>;
  theme: LPTheme;
};

export function CTABlock({ props, theme }: Props) {
  const text = (props.text as string) || "今すぐ購入する";
  const scrollTo = (props.scroll_to as string) || "lot_details";
  const style = (props.style as string) || "primary";

  const handleClick = () => {
    const el = document.getElementById(scrollTo);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isPrimary = style === "primary";
  const buttonStyle: React.CSSProperties = isPrimary
    ? {
        backgroundColor: theme.primary_color || "#6366f1",
        color: "#ffffff",
      }
    : {
        backgroundColor: "transparent",
        color: theme.primary_color || "#6366f1",
        border: `2px solid ${theme.primary_color || "#6366f1"}`,
      };

  return (
    <section className="mx-auto max-w-xl px-6 py-8 text-center">
      <button
        onClick={handleClick}
        className="rounded-full px-10 py-4 text-lg font-bold shadow-lg transition hover:opacity-90"
        style={buttonStyle}
      >
        {text}
      </button>
    </section>
  );
}
