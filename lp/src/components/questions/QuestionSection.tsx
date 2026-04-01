import { getSupabase } from "@/lib/supabase";
import type { ProductQuestion } from "@/lib/types";
import { NewQuestionForm } from "./NewQuestionForm";

type Props = {
  productId: string;
  lotId?: string;
  partnerId: string;
  partnerName: string;
};

export async function QuestionSection({ productId, lotId, partnerId, partnerName }: Props) {
  const { data: questions } = await getSupabase()
    .from("product_questions")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "回答済み")
    .order("answered_at", { ascending: false });

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        メーカー・生産者への質問
      </h2>
      <p className="text-sm text-gray-500">
        {partnerName} に商品やサービスについて質問できます
      </p>

      {(questions as ProductQuestion[] | null)?.map((q) => (
        <div
          key={q.id}
          className="rounded-xl border bg-white p-5 shadow-sm space-y-3"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                Q
              </span>
              <span className="text-xs text-gray-400">
                {q.questioner_name} &middot;{" "}
                {new Date(q.created_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.question}</p>
          </div>
          {q.answer && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  A
                </span>
                <span className="text-xs text-gray-400">
                  {partnerName} &middot;{" "}
                  {q.answered_at
                    ? new Date(q.answered_at).toLocaleDateString("ja-JP")
                    : ""}
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.answer}</p>
            </div>
          )}
        </div>
      ))}

      {(!questions || questions.length === 0) && (
        <p className="text-sm text-gray-400 text-center py-4">
          まだ質問はありません
        </p>
      )}

      <NewQuestionForm
        productId={productId}
        lotId={lotId}
        partnerId={partnerId}
      />
    </div>
  );
}
