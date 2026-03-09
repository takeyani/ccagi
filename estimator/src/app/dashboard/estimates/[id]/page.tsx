import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/estimation/engine";
import { PROJECT_TYPES } from "@/lib/estimation/constants";
import { StatusChanger } from "@/components/estimates/StatusChanger";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: estimate } = await supabase
    .from("estimator_estimates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!estimate) notFound();

  const { data: items } = await supabase
    .from("estimator_estimate_items")
    .select("*")
    .eq("estimate_id", id)
    .order("phase_sort_order")
    .order("task_sort_order");

  const projectTypeLabel =
    PROJECT_TYPES.find((pt) => pt.key === estimate.project_type)?.label ??
    estimate.project_type;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/estimates"
          className="text-gray-500 hover:text-gray-700"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">{estimate.title}</h1>
        <StatusBadge status={estimate.status} />
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <InfoCard label="見積番号" value={estimate.estimate_number} />
        <InfoCard label="プロジェクト種別" value={projectTypeLabel} />
        <InfoCard
          label="顧客"
          value={estimate.customer_company_name || "—"}
        />
        <InfoCard
          label="有効期限"
          value={
            estimate.valid_until
              ? new Date(estimate.valid_until).toLocaleDateString("ja-JP")
              : "—"
          }
        />
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">工程</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">タスク</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">工数(人月)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">単価(円)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">金額(円)</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item, idx) => {
                const showPhase =
                  idx === 0 || item.phase_key !== items[idx - 1].phase_key;
                return (
                  <tr
                    key={item.id}
                    className={`border-b last:border-0 ${
                      !item.is_included ? "opacity-40 line-through" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-medium">
                      {showPhase ? item.phase_name : ""}
                    </td>
                    <td className="px-4 py-2">{item.task_name}</td>
                    <td className="px-4 py-2 text-right">
                      {Number(item.adjusted_man_months).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ¥{formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ¥{formatCurrency(item.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <div className="max-w-sm ml-auto space-y-2 text-sm">
          <div className="flex justify-between">
            <span>合計工数</span>
            <span className="font-bold">
              {Number(estimate.total_man_months).toFixed(2)} 人月
            </span>
          </div>
          <div className="flex justify-between">
            <span>小計</span>
            <span>¥{formatCurrency(estimate.subtotal)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>割引（{Number(estimate.discount_rate)}%OFF）</span>
            <span>-¥{formatCurrency(estimate.discount_amount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>合計金額</span>
            <span>¥{formatCurrency(estimate.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {estimate.notes && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <h3 className="font-bold mb-2">備考</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {estimate.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/estimates/${id}/edit`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          編集
        </Link>
        <a
          href={`/api/estimates/${id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm font-medium"
        >
          PDF出力
        </a>
        <StatusChanger estimateId={id} currentStatus={estimate.status} />
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "下書き": "bg-gray-100 text-gray-700",
    "送付済み": "bg-blue-100 text-blue-700",
    "受注": "bg-green-100 text-green-700",
    "失注": "bg-red-100 text-red-700",
    "アーカイブ": "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        colors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
