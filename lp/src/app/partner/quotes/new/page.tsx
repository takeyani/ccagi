import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { LineItemsForm } from "@/components/partner/LineItemsForm";
import { createQuote } from "../actions";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry_id?: string }>;
}) {
  const sp = await searchParams;
  const { partnerId, supabase } = await requirePartnerId();

  // パートナー情報を取得（デフォルト値用）
  const { data: partner } = await supabase
    .from("partners")
    .select("company_name, payment_terms")
    .eq("id", partnerId)
    .single();

  // 引合いから作成する場合のプリフィル
  let prefill: { buyer_company_name?: string; subject?: string; inquiry_id?: string } = {};
  if (sp.inquiry_id) {
    const { data: inquiry } = await supabase
      .from("agent_inquiries")
      .select("*, user_profiles:buyer_id(display_name), products(name)")
      .eq("id", sp.inquiry_id)
      .eq("partner_id", partnerId)
      .single();
    if (inquiry) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inq = inquiry as any;
      prefill = {
        buyer_company_name: inq.user_profiles?.display_name ?? "",
        subject: inq.products?.name ? `${inq.products.name} お見積り` : "",
        inquiry_id: sp.inquiry_id,
      };
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">見積書 新規作成</h1>
        <Link
          href="/partner/quotes"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          ← 一覧に戻る
        </Link>
      </div>

      <form action={createQuote} className="space-y-6">
        {prefill.inquiry_id && (
          <input type="hidden" name="inquiry_id" value={prefill.inquiry_id} />
        )}

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
                defaultValue={prefill.buyer_company_name ?? ""}
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
          <h2 className="font-semibold mb-4">見積情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                件名 <span className="text-red-500">*</span>
              </label>
              <input
                name="subject"
                required
                defaultValue={prefill.subject ?? ""}
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
                有効期限
              </label>
              <input
                name="valid_until"
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
          <LineItemsForm />
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
