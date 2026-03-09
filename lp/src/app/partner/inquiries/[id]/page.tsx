import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { ScoreBar } from "@/components/buyer/ScoreBar";
import { updateInquiryStatus } from "../actions";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const { data: inquiry } = await supabase
    .from("agent_inquiries")
    .select(
      `*,
       products(name, base_price, description),
       lots(lot_number, price, stock, status),
       user_profiles:buyer_id(display_name),
       agent_results:agent_result_id(
         certification_score, proof_chain_score,
         tag_match_score, price_match_score, spec_match_score
       )`
    )
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!inquiry) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = inquiry as any;
  const scores = r.agent_results;
  const isResolved = r.partner_status === "承諾" || r.partner_status === "辞退";

  const acceptAction = updateInquiryStatus.bind(null, id, "承諾");
  const rejectAction = updateInquiryStatus.bind(null, id, "辞退");
  const progressAction = updateInquiryStatus.bind(null, id, "対応中");

  const statusBadge: Record<string, string> = {
    新規: "bg-blue-100 text-blue-700",
    対応中: "bg-yellow-100 text-yellow-700",
    承諾: "bg-green-100 text-green-700",
    辞退: "bg-red-100 text-red-600",
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">引合い詳細</h1>
        <Link
          href="/partner/inquiries"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          ← 引合い一覧に戻る
        </Link>
      </div>

      {/* ステータス */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge[r.partner_status] ?? "bg-gray-100 text-gray-600"}`}
        >
          {r.partner_status}
        </span>
      </div>

      {/* 商品・ロット情報 */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">商品情報</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">商品名</dt>
            <dd className="font-medium mt-1">{r.products?.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">バイヤー</dt>
            <dd className="font-medium mt-1">
              {r.user_profiles?.display_name ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">ロット</dt>
            <dd className="font-medium mt-1">{r.lots?.lot_number}</dd>
          </div>
          <div>
            <dt className="text-gray-500">在庫</dt>
            <dd className="font-medium mt-1">{r.lots?.stock}</dd>
          </div>
          <div>
            <dt className="text-gray-500">価格</dt>
            <dd className="font-medium mt-1">
              &yen;
              {(r.lots?.price ?? r.products?.base_price)?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">ロット状態</dt>
            <dd className="mt-1">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  r.lots?.status === "販売中"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                {r.lots?.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* バイヤー希望条件 */}
      {(r.buyer_price != null || r.buyer_quantity != null || r.buyer_notes) && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">バイヤー希望条件</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {r.buyer_price != null && (
              <div>
                <dt className="text-gray-500">希望価格</dt>
                <dd className="font-medium mt-1">
                  &yen;{Number(r.buyer_price).toLocaleString()}
                  {(() => {
                    const lotPrice = r.lots?.price ?? r.products?.base_price;
                    if (lotPrice && r.buyer_price != null) {
                      const diff = r.buyer_price - lotPrice;
                      if (diff !== 0) {
                        return (
                          <span
                            className={`ml-2 text-xs font-medium ${diff > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            ({diff > 0 ? "+" : ""}&yen;{diff.toLocaleString()})
                          </span>
                        );
                      }
                    }
                    return null;
                  })()}
                </dd>
              </div>
            )}
            {r.buyer_quantity != null && (
              <div>
                <dt className="text-gray-500">希望数量</dt>
                <dd className="font-medium mt-1">{r.buyer_quantity}</dd>
              </div>
            )}
            {r.buyer_notes && (
              <div className="col-span-2">
                <dt className="text-gray-500">メモ</dt>
                <dd className="mt-1 bg-gray-50 rounded p-3 text-sm">
                  {r.buyer_notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* スコア内訳 */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">スコア内訳</h2>
          <div className="text-center">
            <span className="text-3xl font-bold text-teal-600">
              {Number(r.total_score).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 ml-1">/ 100</span>
          </div>
        </div>
        {scores && (
          <div className="space-y-2">
            <ScoreBar label="認証" value={scores.certification_score} />
            <ScoreBar label="証明" value={scores.proof_chain_score} />
            <ScoreBar label="タグ" value={scores.tag_match_score} />
            <ScoreBar label="成分" value={scores.spec_match_score} />
            <ScoreBar label="価格" value={scores.price_match_score} />
          </div>
        )}
      </div>

      {/* 対応履歴 */}
      {r.responded_at && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">対応履歴</h2>
          <p className="text-sm text-gray-500">
            回答日時:{" "}
            {new Date(r.responded_at).toLocaleString("ja-JP")}
          </p>
          {r.response_notes && (
            <p className="text-sm mt-2 bg-gray-50 rounded p-3">
              {r.response_notes}
            </p>
          )}
        </div>
      )}

      {/* アクションエリア */}
      {/* 承諾済みの場合、見積書作成ボタン */}
      {r.partner_status === "承諾" && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
          <Link
            href={`/partner/quotes/new?inquiry_id=${id}`}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            見積書を作成
          </Link>
        </div>
      )}

      {!isResolved ? (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">対応</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                回答メモ
              </label>
              <textarea
                name="response_notes"
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="取引先としてのコメントを入力..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                辞退理由（辞退する場合は必須）
              </label>
              <textarea
                name="rejection_reason"
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="辞退する場合、理由を入力してください..."
              />
            </div>
            <div className="flex gap-3">
              {r.partner_status === "新規" && (
                <button
                  type="submit"
                  formAction={progressAction}
                  className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium"
                >
                  対応開始
                </button>
              )}
              <button
                type="submit"
                formAction={acceptAction}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                承諾
              </button>
              <button
                type="submit"
                formAction={rejectAction}
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
              >
                辞退
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border p-6 text-center text-gray-500">
          <p>この引合いは対応済みです（{r.partner_status}）</p>
          {r.rejection_reason && (
            <p className="mt-2 text-red-600 text-sm">
              辞退理由: {r.rejection_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
