import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { BoardThread } from "@/lib/types";
import { NewThreadForm } from "./NewThreadForm";

type Props = {
  targetType: "product" | "lot";
  targetId: string;
};

export async function BoardSection({ targetType, targetId }: Props) {
  const { data: threads } = await getSupabase()
    .from("board_threads")
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false });

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">掲示板</h2>

      {(threads ?? []).length > 0 && (
        <div className="space-y-2">
          {(threads as BoardThread[]).map((thread) => (
            <Link
              key={thread.id}
              href={`/boards/${thread.id}`}
              className="block rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{thread.title}</h3>
                <span className="text-xs text-gray-400">
                  {new Date(thread.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {thread.author_name}
              </p>
            </Link>
          ))}
        </div>
      )}

      <NewThreadForm targetType={targetType} targetId={targetId} />
    </div>
  );
}
