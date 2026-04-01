import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteQuestion } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminQuestionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: q } = await supabase
    .from("product_questions")
    .select("*, products(name), partners(company_name)")
    .eq("id", id)
    .single();

  if (!q) notFound();

  const deleteWithId = deleteQuestion.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">質問の詳細</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">商品:</span>{" "}
            <span className="font-medium">{(q.products as { name: string })?.name}</span>
          </div>
          <div>
            <span className="text-gray-500">取引先:</span>{" "}
            <span className="font-medium">{(q.partners as { company_name: string })?.company_name}</span>
          </div>
          <div>
            <span className="text-gray-500">質問者:</span>{" "}
            <span className="font-medium">{q.questioner_name}</span>
          </div>
          <div>
            <span className="text-gray-500">ステータス:</span>{" "}
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
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">質問</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.question}</p>
        </div>

        {q.answer && (
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs font-medium text-gray-500 mb-1">回答</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.answer}</p>
          </div>
        )}

        <form action={deleteWithId}>
          <button
            type="submit"
            className="text-red-600 hover:text-red-800 text-sm"
          >
            この質問を削除
          </button>
        </form>
      </div>
    </div>
  );
}
