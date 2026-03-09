"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  props: Record<string, unknown>;
};

export function FAQBlock({ props }: Props) {
  const heading = (props.heading as string) || "";
  const items = (props.items as FAQItem[]) || [];

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      {heading && (
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          {heading}
        </h2>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <FAQItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-400 transition ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t px-6 py-4 text-sm text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}
