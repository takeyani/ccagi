"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children = "保存",
  pendingText = "保存中...",
  className = "bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50",
}: {
  children?: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
