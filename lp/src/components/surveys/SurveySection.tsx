import { getSupabase } from "@/lib/supabase";
import type { Survey, SurveyQuestion } from "@/lib/types";
import { SurveyForm } from "./SurveyForm";

type Props = {
  targetType: "lot" | "product" | "general";
  targetId: string;
  productId?: string;
};

export async function SurveySection({ targetType, targetId, productId }: Props) {
  const supabase = getSupabase();

  // ロット固有 + 商品固有 + 汎用アンケートをすべて取得
  const targetFilters: { target_type: string; target_id: string | null }[] = [
    { target_type: targetType, target_id: targetId },
    { target_type: "general", target_id: null },
  ];
  if (productId && targetType === "lot") {
    targetFilters.push({ target_type: "product", target_id: productId });
  }

  const { data: surveys } = await supabase
    .from("surveys")
    .select("*")
    .eq("is_active", true)
    .or(
      targetFilters
        .map((f) =>
          f.target_id
            ? `and(target_type.eq.${f.target_type},target_id.eq.${f.target_id})`
            : `and(target_type.eq.${f.target_type},target_id.is.null)`
        )
        .join(",")
    )
    .order("created_at", { ascending: false });

  if (!surveys || surveys.length === 0) return null;

  // 各アンケートの質問を取得
  const surveyIds = surveys.map((s: Survey) => s.id);
  const { data: questions } = await supabase
    .from("survey_questions")
    .select("*")
    .in("survey_id", surveyIds)
    .order("sort_order", { ascending: true });

  const questionsBySurvey = (questions ?? []).reduce(
    (acc: Record<string, SurveyQuestion[]>, q: SurveyQuestion) => {
      if (!acc[q.survey_id]) acc[q.survey_id] = [];
      acc[q.survey_id].push(q);
      return acc;
    },
    {} as Record<string, SurveyQuestion[]>
  );

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">アンケート</h2>
      {surveys.map((survey: Survey) => (
        <SurveyForm
          key={survey.id}
          survey={survey}
          questions={questionsBySurvey[survey.id] ?? []}
        />
      ))}
    </div>
  );
}
