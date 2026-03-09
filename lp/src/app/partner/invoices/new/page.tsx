import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { LineItemsForm } from "@/components/partner/LineItemsForm";
import { createInvoice } from "../actions";

export default async function NewInvoicePage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: partner } = await supabase
    .from("partners")
    .select("payment_terms, invoice_registration_number")
    .eq("id", partnerId)
    .single();

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">請求書 新規作成</h1>
        <Link
          href="/partner/invoices"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          ← 一覧に戻る
        </Link>
      </div>

      {!partner?.invoice_registration_number && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          インボイス登録番号が未設定です。
          <Link href="/partner/profile" className="underline ml-1">
            プロフィール
          </Link>
          から設定してください。
        </div>
      )}

      <form action={createInvoice} className="space-y-6">
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当者名
              </label>
              <input
                name="buyer_contact_name"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                name="buyer_postal_code"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <input
                name="buyer_address"
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
                defaultValue={today}
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支払条件
              </label>
              <input
                name="payment_terms"
                defaultValue={partner?.payment_terms ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">明細</h2>
          <LineItemsForm showTaxBreakdown />
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            name="notes"
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
        >
          保存
        </button>
      </form>
    </div>
  );
}
