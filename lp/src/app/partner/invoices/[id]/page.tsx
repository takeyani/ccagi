import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { LineItemsForm, type ItemRow } from "@/components/partner/LineItemsForm";
import {
  updateInvoice,
  sendInvoice,
  markInvoicePaid,
  cancelInvoice,
  createDeliverySlipFromInvoice,
} from "../actions";
import { requestApproval } from "../../approvals/actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!invoice) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any;
  const isDraft = inv.status === "下書き";

  // 承認状態チェック
  const { data: approval } = await supabase
    .from("approvals")
    .select("id, status, comment")
    .eq("entity_type", "invoice")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isApproved = approval?.status === "承認済み";
  const isPendingApproval = approval?.status === "承認待ち";
  const isRejected = approval?.status === "差戻し";

  const items: ItemRow[] = (inv.invoice_items ?? [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((it: { item_name: string; description: string; quantity: number; unit: string; unit_price: number; tax_rate: number; amount: number; tax_amount: number }) => ({
      item_name: it.item_name,
      description: it.description ?? "",
      quantity: it.quantity,
      unit: it.unit,
      unit_price: it.unit_price,
      tax_rate: Number(it.tax_rate),
      amount: it.amount,
      tax_amount: it.tax_amount,
    }));

  const updateAction = updateInvoice.bind(null, id);
  const sendAction = sendInvoice.bind(null, id);
  const paidAction = markInvoicePaid.bind(null, id);
  const cancelAction = cancelInvoice.bind(null, id);
  const toSlipAction = createDeliverySlipFromInvoice.bind(null, id);
  const requestApprovalAction = requestApproval.bind(null, "invoice", id);

  const statusBadge: Record<string, string> = {
    下書き: "bg-gray-100 text-gray-600",
    送付済み: "bg-blue-100 text-blue-700",
    入金済み: "bg-green-100 text-green-700",
    期限超過: "bg-red-100 text-red-600",
    取消: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">請求書 {inv.document_number}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge[inv.status] ?? "bg-gray-100 text-gray-600"}`}
          >
            {inv.status}
          </span>
          {isPendingApproval && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
              承認待ち
            </span>
          )}
          {isApproved && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              承認済み
            </span>
          )}
          {isRejected && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600">
              差戻し
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/partner/invoices/${id}/print`}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
            target="_blank"
          >
            印刷
          </Link>
          <Link
            href="/partner/invoices"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2"
          >
            ← 一覧に戻る
          </Link>
        </div>
      </div>

      {/* 差戻しコメント表示 */}
      {isRejected && approval?.comment && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            <span className="font-medium">差戻しコメント:</span> {approval.comment}
          </p>
        </div>
      )}

      {/* ステータス操作 */}
      <div className="flex gap-2 mb-6">
        {isDraft && !isPendingApproval && !isApproved && (
          <form action={requestApprovalAction}>
            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium"
            >
              承認申請
            </button>
          </form>
        )}
        {isDraft && isApproved && (
          <form action={sendAction}>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              送付済みにする
            </button>
          </form>
        )}
        {inv.status === "送付済み" && (
          <form action={paidAction}>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              入金済みにする
            </button>
          </form>
        )}
        {(inv.status === "下書き" || inv.status === "送付済み") && (
          <form action={cancelAction}>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
            >
              取消
            </button>
          </form>
        )}
        {inv.status !== "取消" && (
          <form action={toSlipAction}>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium"
            >
              納品書を作成
            </button>
          </form>
        )}
      </div>

      {isDraft ? (
        <form action={updateAction} className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">宛先情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  宛先会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  name="buyer_company_name"
                  required
                  defaultValue={inv.buyer_company_name}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者名
                </label>
                <input
                  name="buyer_contact_name"
                  defaultValue={inv.buyer_contact_name ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  郵便番号
                </label>
                <input
                  name="buyer_postal_code"
                  defaultValue={inv.buyer_postal_code ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <input
                  name="buyer_address"
                  defaultValue={inv.buyer_address ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">請求情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  name="subject"
                  required
                  defaultValue={inv.subject}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  発行日 <span className="text-red-500">*</span>
                </label>
                <input
                  name="issue_date"
                  type="date"
                  required
                  defaultValue={inv.issue_date}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払期限
                </label>
                <input
                  name="due_date"
                  type="date"
                  defaultValue={inv.due_date ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払条件
                </label>
                <input
                  name="payment_terms"
                  defaultValue={inv.payment_terms ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">明細</h2>
            <LineItemsForm initialItems={items} showTaxBreakdown />
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={inv.notes ?? ""}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            更新
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">宛先情報</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">宛先会社名</dt>
                <dd className="font-medium mt-1">{inv.buyer_company_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">担当者名</dt>
                <dd className="font-medium mt-1">{inv.buyer_contact_name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">郵便番号</dt>
                <dd className="font-medium mt-1">{inv.buyer_postal_code ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">住所</dt>
                <dd className="font-medium mt-1">{inv.buyer_address ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">請求情報</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <dt className="text-gray-500">件名</dt>
                <dd className="font-medium mt-1">{inv.subject}</dd>
              </div>
              <div>
                <dt className="text-gray-500">発行日</dt>
                <dd className="font-medium mt-1">{inv.issue_date}</dd>
              </div>
              <div>
                <dt className="text-gray-500">支払期限</dt>
                <dd className="font-medium mt-1">{inv.due_date ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">支払条件</dt>
                <dd className="font-medium mt-1">{inv.payment_terms ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">登録番号</dt>
                <dd className="font-medium mt-1">{inv.invoice_registration_number ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">明細</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">品名</th>
                  <th className="border px-2 py-1 text-right">数量</th>
                  <th className="border px-2 py-1">単位</th>
                  <th className="border px-2 py-1 text-right">単価</th>
                  <th className="border px-2 py-1">税率</th>
                  <th className="border px-2 py-1 text-right">金額</th>
                  <th className="border px-2 py-1 text-right">税額</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">{it.item_name}</td>
                    <td className="border px-2 py-1 text-right">{it.quantity}</td>
                    <td className="border px-2 py-1">{it.unit}</td>
                    <td className="border px-2 py-1 text-right">&yen;{it.unit_price.toLocaleString()}</td>
                    <td className="border px-2 py-1">{it.tax_rate}%</td>
                    <td className="border px-2 py-1 text-right">&yen;{it.amount.toLocaleString()}</td>
                    <td className="border px-2 py-1 text-right">&yen;{it.tax_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <dl className="text-sm space-y-1 w-64">
                <div className="flex justify-between">
                  <dt className="text-gray-500">小計</dt>
                  <dd>&yen;{inv.subtotal.toLocaleString()}</dd>
                </div>
                {inv.tax_10_total > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">消費税（10%）</dt>
                    <dd>&yen;{inv.tax_10_total.toLocaleString()}</dd>
                  </div>
                )}
                {inv.tax_8_total > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">消費税（8%）</dt>
                    <dd>&yen;{inv.tax_8_total.toLocaleString()}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">消費税合計</dt>
                  <dd>&yen;{inv.tax_total.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <dt>合計</dt>
                  <dd>&yen;{inv.total.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {inv.notes && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="font-semibold mb-2">備考</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{inv.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
