import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { answerQuestion } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PartnerQuestionDetailPage({ params }: Props) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const { data: q } = await supabase
    .from("product_questions")
    .select("*, products(name)")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!q) notFound();

  const answerWithId = answerQuestion.bind(null, id);

  return (
    <div>
      <Link
        href="/partner/questions"
        className="text-sm text-orange-600 hover:text-orange-800 mb-4 inline-block"
      >
        &larr; 質問一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6">質問の詳細</h1>

      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl space-y-6">
        {/* 質問情報 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {(q.products as { name: string })?.name}
            </h2>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                q.status === "未回答"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {q.status}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            質問者: {q.questioner_name}
            {q.questioner_email && ` (${q.questioner_email})`}
            {" "}&middot;{" "}
            {new Date(q.created_at).toLocaleString("ja-JP")}
          </div>
        </div>

        {/* 質問内容 */}
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-orange-100/60 px-2.5 py-0.5 text-xs font-medium text-orange-800">
              Q
            </span>
            <span className="text-sm font-medium text-gray-900">質問内容</span>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.question}</p>
        </div>

        {/* 既存の回答 */}
        {q.answer && (
          <div className="rounded-xl bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                A
              </span>
              <span className="text-sm font-medium text-gray-900">回答内容</span>
              {q.answered_at && (
                <span className="text-xs text-gray-400">
                  {new Date(q.answered_at).toLocaleString("ja-JP")}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.answer}</p>
          </div>
        )}

        {/* 回答フォーム */}
        <form action={answerWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {q.answer ? "回答を修正" : "回答を入力"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="answer"
              required
              rows={5}
              defaultValue={q.answer ?? ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder="お客様の質問に回答してください"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium text-sm"
          >
            {q.answer ? "回答を更新" : "回答を送信"}
          </button>
        </form>
      </div>
    </div>
  );
}
