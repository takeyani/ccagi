import { getAuthorizations, approveAuthorization, rejectAuthorization, requestAuthorization, grantAuthorization } from "./actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requirePartnerId } from "@/lib/auth";

export const metadata = { title: "商品承認管理" };

const statusBadge: Record<string, string> = {
  "申請中": "bg-yellow-100 text-yellow-800",
  "承認済み": "bg-green-100 text-green-800",
  "却下": "bg-red-100 text-red-800",
  "取消": "bg-gray-100 text-gray-600",
};

export default async function AuthorizationsPage() {
  const { incoming, outgoing } = await getAuthorizations();
  const supabase = await createSupabaseServerClient();
  const partnerId = await requirePartnerId();

  // 自社パートナー情報
  const { data: myPartner } = await supabase
    .from("partners")
    .select("partner_type")
    .eq("id", partnerId)
    .single();

  const isManufacturer = myPartner?.partner_type === "メーカー";

  // メーカーの場合: 承認対象の代理店・クリエイター一覧
  let dealers: { id: string; company_name: string }[] = [];
  let creators: { id: string; name: string; code: string }[] = [];
  let myProducts: { id: string; name: string }[] = [];

  if (isManufacturer) {
    const { data: d } = await supabase
      .from("partners")
      .select("id, company_name")
      .eq("partner_type", "代理店");
    dealers = d ?? [];

    const { data: c } = await supabase
      .from("affiliates")
      .select("id, name, code")
      .eq("is_creator", true);
    creators = c ?? [];

    const { data: p } = await supabase
      .from("products")
      .select("id, name")
      .eq("partner_id", partnerId)
      .eq("is_active", true);
    myProducts = p ?? [];
  }

  // 代理店の場合: 承認申請可能な商品一覧
  let availableProducts: { id: string; name: string; partners: { company_name: string } | null }[] = [];
  if (!isManufacturer) {
    const { data: p } = await supabase
      .from("products")
      .select("id, name, partners(company_name)")
      .eq("is_active", true);
    availableProducts = (p ?? []) as typeof availableProducts;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">商品承認管理</h1>

      {/* メーカー: 承認依頼を受けた一覧 */}
      {isManufacturer && incoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">受信した承認リクエスト</h2>
          <div className="bg-white rounded-xl border divide-y">
            {incoming.filter((a: Record<string, unknown>) => a.status === "申請中").map((auth: Record<string, unknown>) => (
              <div key={auth.id as string} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{(auth.products as Record<string, unknown>)?.name as string}</p>
                  <p className="text-sm text-gray-500">
                    {auth.authorized_party_type as string} | {auth.requested_by as string}からの申請
                  </p>
                  {auth.request_message && (
                    <p className="text-sm text-gray-600 mt-1">{auth.request_message as string}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={async () => {
                    "use server";
                    await approveAuthorization(auth.id as string);
                  }}>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      承認
                    </button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await rejectAuthorization(auth.id as string);
                  }}>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                      却下
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {incoming.filter((a: Record<string, unknown>) => a.status === "申請中").length === 0 && (
              <p className="p-4 text-gray-500 text-sm">承認待ちのリクエストはありません</p>
            )}
          </div>
        </section>
      )}

      {/* メーカー: 新規承認付与 */}
      {isManufacturer && myProducts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">承認を付与する</h2>
          <form action={grantAuthorization} className="bg-white rounded-xl border p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品</label>
              <select name="product_id" required className="w-full border rounded-lg px-3 py-2">
                <option value="">選択してください</option>
                {myProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">承認先タイプ</label>
              <select name="party_type" required className="w-full border rounded-lg px-3 py-2">
                <option value="代理店">代理店</option>
                <option value="クリエイター">クリエイター</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">承認先</label>
              <select name="party_id" required className="w-full border rounded-lg px-3 py-2">
                <optgroup label="代理店">
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>{d.company_name}</option>
                  ))}
                </optgroup>
                <optgroup label="クリエイター">
                  {creators.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-1">許可アクション</legend>
              <div className="flex gap-4">
                {["販売", "LP作成", "価格設定"].map((action) => (
                  <label key={action} className="flex items-center gap-1 text-sm">
                    <input type="checkbox" name="actions" value={action} defaultChecked={action !== "価格設定"} />
                    {action}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              承認を付与
            </button>
          </form>
        </section>
      )}

      {/* 代理店: 承認リクエスト送信 */}
      {!isManufacturer && availableProducts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">承認をリクエストする</h2>
          <form action={requestAuthorization} className="bg-white rounded-xl border p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品</label>
              <select name="product_id" required className="w-full border rounded-lg px-3 py-2">
                <option value="">選択してください</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.partners?.company_name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ（任意）</label>
              <textarea name="message" rows={3} className="w-full border rounded-lg px-3 py-2" placeholder="承認をお願いする理由..." />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              承認リクエスト送信
            </button>
          </form>
        </section>
      )}

      {/* 全承認履歴 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">承認履歴</h2>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">商品</th>
                <th className="text-left px-4 py-3 font-medium">タイプ</th>
                <th className="text-left px-4 py-3 font-medium">起点</th>
                <th className="text-left px-4 py-3 font-medium">ステータス</th>
                <th className="text-left px-4 py-3 font-medium">日時</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...incoming, ...outgoing]
                .filter((v, i, a) => a.findIndex((t: Record<string, unknown>) => t.id === v.id) === i)
                .map((auth: Record<string, unknown>) => (
                <tr key={auth.id as string}>
                  <td className="px-4 py-3">{(auth.products as Record<string, unknown>)?.name as string}</td>
                  <td className="px-4 py-3">{auth.authorized_party_type as string}</td>
                  <td className="px-4 py-3">{auth.requested_by as string}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[auth.status as string] ?? ""}`}>
                      {auth.status as string}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(auth.created_at as string).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
