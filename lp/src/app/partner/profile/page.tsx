import { requirePartnerId } from "@/lib/auth";
import { updatePartnerProfile } from "./actions";

export default async function PartnerProfilePage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("id", partnerId)
    .single();

  if (!partner) return <p>取引先情報が見つかりません</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">プロフィール</h1>
      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        {/* Editable info */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">会社情報</h2>
          <form action={updatePartnerProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社名
              </label>
              <input
                name="company_name"
                required
                defaultValue={partner.company_name}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当者名
              </label>
              <input
                name="contact_name"
                defaultValue={partner.contact_name ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                name="phone"
                defaultValue={partner.phone ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                name="postal_code"
                defaultValue={partner.postal_code ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <input
                name="address"
                defaultValue={partner.address ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <hr className="my-2" />
            <h3 className="font-semibold text-sm text-gray-700">インボイス制度</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                適格請求書発行事業者登録番号
              </label>
              <input
                name="invoice_registration_number"
                defaultValue={partner.invoice_registration_number ?? ""}
                placeholder="T1234567890123"
                pattern="^T\d{13}$"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">T + 13桁の数字</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                登録日
              </label>
              <input
                name="invoice_registration_date"
                type="date"
                defaultValue={partner.invoice_registration_date ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              更新
            </button>
          </form>
        </div>

        {/* Read-only info */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">契約情報</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">メール</dt>
              <dd>{partner.email ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">種別</dt>
              <dd>{partner.partner_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">契約開始日</dt>
              <dd>{partner.contract_start_date ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">支払条件</dt>
              <dd>{partner.payment_terms ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">認証ステータス</dt>
              <dd>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    partner.certification_status === "認証済み"
                      ? "bg-green-100 text-green-700"
                      : partner.certification_status === "期限切れ"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {partner.certification_status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">認証番号</dt>
              <dd>{partner.certification_number ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">認証有効期限</dt>
              <dd>{partner.certification_expiry ?? "-"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
