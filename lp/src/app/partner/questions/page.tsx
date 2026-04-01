import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import type { ProductQuestion } from "@/lib/types";

export default async function PartnerQuestionsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: questions } = await supabase
    .from("product_questions")
    .select("*, products(name)")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">商品Q&A</h1>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">質問者</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">質問（抜粋）</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">受信日</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(questions as (ProductQuestion & { products: { name: string } })[] | null)?.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/partner/questions/${q.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {q.products?.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{q.questioner_name}</td>
                <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                  {q.question.slice(0, 60)}
                  {q.question.length > 60 ? "..." : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      q.status === "未回答"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(q.created_at).toLocaleDateString("ja-JP")}
                </td>
              </tr>
            ))}
            {(!questions || questions.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  質問はまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
