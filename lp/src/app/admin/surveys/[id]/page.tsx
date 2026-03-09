import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateSurvey, deleteSurvey } from "../actions";
import { SurveyQuestionEditor } from "@/components/admin/SurveyQuestionEditor";
import type { Survey, SurveyQuestion, SurveyResponse, Product, Lot } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSurveyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: survey } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", id)
    .single<Survey>();

  if (!survey) notFound();

  const { data: questions } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("survey_id", id)
    .order("sort_order", { ascending: true });

  const { data: responses } = await supabase
    .from("survey_responses")
    .select("*, survey_answers(*)")
    .eq("survey_id", id)
    .order("created_at", { ascending: false });

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const { data: lots } = await supabase
    .from("lots")
    .select("id, lot_number, product_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const updateWithId = updateSurvey.bind(null, id);
  const deleteWithId = deleteSurvey.bind(null, id);

  const initialQuestions = (questions as SurveyQuestion[] | null)?.map((q) => ({
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options as string[],
    is_required: q.is_required,
    sort_order: q.sort_order,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">アンケート編集</h1>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            削除
          </button>
        </form>
      </div>

      <form action={updateWithId} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            name="title"
            required
            defaultValue={survey.title}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={survey.description ?? ""}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象タイプ
            </label>
            <select
              name="target_type"
              defaultValue={survey.target_type}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="general">汎用</option>
              <option value="product">商品</option>
              <option value="lot">ロット</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象ID
            </label>
            <select
              name="target_id"
              defaultValue={survey.target_id ?? ""}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">なし</option>
              <optgroup label="商品">
                {(products ?? []).map((p: Pick<Product, "id" | "name">) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="ロット">
                {(lots ?? []).map(
                  (l: Pick<Lot, "id" | "lot_number" | "product_id">) => (
                    <option key={l.id} value={l.id}>
                      {l.lot_number}
                    </option>
                  )
                )}
              </optgroup>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={survey.is_active}
          />
          有効にする
        </label>

        <hr />

        <SurveyQuestionEditor initialQuestions={initialQuestions} />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          更新する
        </button>
      </form>

      {/* 回答一覧 */}
      <div className="mt-12 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">
          回答一覧（{(responses ?? []).length}件）
        </h2>
        {(responses ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">まだ回答がありません</p>
        ) : (
          <div className="space-y-4">
            {(
              responses as (SurveyResponse & {
                survey_answers: { question_id: string; answer_text: string | null; answer_options: string[] }[];
              })[]
            ).map((resp) => (
              <div
                key={resp.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {resp.respondent_name || "匿名"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(resp.created_at).toLocaleString("ja-JP")}
                  </span>
                </div>
                {resp.survey_answers.map((ans, i) => {
                  const q = (questions as SurveyQuestion[])?.find(
                    (qq) => qq.id === ans.question_id
                  );
                  return (
                    <div key={i} className="mt-2 text-sm">
                      <span className="font-medium text-gray-600">
                        {q?.question_text ?? "質問"}:
                      </span>{" "}
                      <span className="text-gray-900">
                        {ans.answer_text ||
                          (ans.answer_options ?? []).join(", ") ||
                          "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
