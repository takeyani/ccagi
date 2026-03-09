import { requirePartnerId } from "@/lib/auth";
import { approveDocument, rejectDocument } from "./actions";
import type { Approval } from "@/lib/types";

export default async function ApprovalsPage() {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: approvals } = await supabase
    .from("approvals")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  const items = (approvals ?? []) as Approval[];

  const pending = items.filter((a) => a.status === "承認待ち");
  const myRequests = items.filter((a) => a.requested_by === profile.id);
  const canApprove = pending.filter((a) => a.requested_by !== profile.id);

  const statusBadge: Record<string, string> = {
    承認待ち: "bg-yellow-100 text-yellow-700",
    承認済み: "bg-green-100 text-green-700",
    差戻し: "bg-red-100 text-red-600",
  };

  const entityLabel = (type: string) => (type === "quote" ? "見積書" : "請求書");
  const entityLink = (a: Approval) =>
    `/partner/${a.entity_type === "quote" ? "quotes" : "invoices"}/${a.entity_id}`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">承認管理</h1>

      {/* 承認可能な申請 */}
      {canApprove.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">承認待ち（あなたが承認可能）</h2>
          <div className="space-y-3">
            {canApprove.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {entityLabel(a.entity_type)} {a.document_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                  <a href={entityLink(a)} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    帳票を確認
                  </a>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  申請日: {new Date(a.requested_at).toLocaleString("ja-JP")}
                </p>
                <div className="flex gap-2">
                  <form action={approveDocument.bind(null, a.id)}>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      承認
                    </button>
                  </form>
                  <form action={rejectDocument.bind(null, a.id)} className="flex gap-2">
                    <input
                      name="comment"
                      placeholder="差戻しコメント"
                      className="border rounded-lg px-3 py-1.5 text-sm w-48"
                    />
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 text-sm font-medium"
                    >
                      差戻し
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 自分が申請中 */}
      <h2 className="text-lg font-semibold mb-3">自分の申請</h2>
      <div className="bg-white rounded-xl border shadow-sm divide-y">
        {myRequests.length === 0 && (
          <div className="p-6 text-gray-400 text-sm text-center">申請はありません</div>
        )}
        {myRequests.map((a) => (
          <div key={a.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a href={entityLink(a)} className="font-medium text-indigo-600 hover:text-indigo-800">
                  {entityLabel(a.entity_type)} {a.document_number}
                </a>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[a.status]}`}>
                  {a.status}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(a.requested_at).toLocaleString("ja-JP")}
              </span>
            </div>
            {a.comment && (
              <p className="text-sm text-red-600 mt-1">コメント: {a.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
