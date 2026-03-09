import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { LineItemsForm, type ItemRow } from "@/components/partner/LineItemsForm";
import { updateDeliverySlip, issueDeliverySlip } from "../actions";

export default async function DeliverySlipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const { data: slip } = await supabase
    .from("delivery_slips")
    .select("*, delivery_slip_items(*)")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!slip) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ds = slip as any;
  const isDraft = ds.status === "下書き";

  const items: ItemRow[] = (ds.delivery_slip_items ?? [])
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

  const updateAction = updateDeliverySlip.bind(null, id);
  const issueAction = issueDeliverySlip.bind(null, id);

  const statusBadge: Record<string, string> = {
    下書き: "bg-gray-100 text-gray-600",
    発行済み: "bg-green-100 text-green-700",
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">納品書 {ds.document_number}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge[ds.status] ?? "bg-gray-100 text-gray-600"}`}
          >
            {ds.status}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/partner/delivery-slips/${id}/print`}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
            target="_blank"
          >
            印刷
          </Link>
          <Link
            href="/partner/delivery-slips"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2"
          >
            ← 一覧に戻る
          </Link>
        </div>
      </div>

      {isDraft && (
        <div className="flex gap-2 mb-6">
          <form action={issueAction}>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              発行済みにする
            </button>
          </form>
        </div>
      )}

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
                  defaultValue={ds.buyer_company_name}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者名
                </label>
                <input
                  name="buyer_contact_name"
                  defaultValue={ds.buyer_contact_name ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  郵便番号
                </label>
                <input
                  name="buyer_postal_code"
                  defaultValue={ds.buyer_postal_code ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <input
                  name="buyer_address"
                  defaultValue={ds.buyer_address ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">納品情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  name="subject"
                  required
                  defaultValue={ds.subject}
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
                  defaultValue={ds.issue_date}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  納品日
                </label>
                <input
                  name="delivery_date"
                  type="date"
                  defaultValue={ds.delivery_date ?? ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">明細</h2>
            <LineItemsForm initialItems={items} />
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={ds.notes ?? ""}
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
                <dd className="font-medium mt-1">{ds.buyer_company_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">担当者名</dt>
                <dd className="font-medium mt-1">{ds.buyer_contact_name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">郵便番号</dt>
                <dd className="font-medium mt-1">{ds.buyer_postal_code ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">住所</dt>
                <dd className="font-medium mt-1">{ds.buyer_address ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold mb-4">納品情報</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <dt className="text-gray-500">件名</dt>
                <dd className="font-medium mt-1">{ds.subject}</dd>
              </div>
              <div>
                <dt className="text-gray-500">発行日</dt>
                <dd className="font-medium mt-1">{ds.issue_date}</dd>
              </div>
              <div>
                <dt className="text-gray-500">納品日</dt>
                <dd className="font-medium mt-1">{ds.delivery_date ?? "-"}</dd>
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
                  <th className="border px-2 py-1 text-right">金額</th>
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
                    <td className="border px-2 py-1 text-right">&yen;{it.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <dl className="text-sm space-y-1 w-64">
                <div className="flex justify-between">
                  <dt className="text-gray-500">小計</dt>
                  <dd>&yen;{ds.subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">消費税</dt>
                  <dd>&yen;{ds.tax_total.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <dt>合計</dt>
                  <dd>&yen;{ds.total.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {ds.notes && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="font-semibold mb-2">備考</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ds.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
