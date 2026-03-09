"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ESTIMATE_STATUSES } from "@/lib/estimation/constants";

type Props = {
  estimateId: string;
  currentStatus: string;
};

export function StatusChanger({ estimateId, currentStatus }: Props) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("estimator_estimates")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", estimateId);

    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
    >
      {ESTIMATE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
