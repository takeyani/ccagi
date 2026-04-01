import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AspAdvertiser, AspProgram, AspConversion } from "@/lib/types";

export default async function AdminAspPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: advertisers },
    { data: programs },
    { data: conversions },
  ] = await Promise.all([
    supabase.from("asp_advertisers").select("*").order("created_at", { ascending: false }),
    supabase.from("asp_programs").select("*, asp_advertisers(name)").order("created_at", { ascending: false }),
    supabase
      .from("asp_conversions")
      .select("*, asp_programs(name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // 集計
  const totalConversions = (conversions ?? []).length;
  const totalAmount = (conversions ?? []).reduce((s, c: AspConversion) => s + c.amount, 0);
  const totalCommission = (conversions ?? []).reduce((s, c: AspConversion) => s + c.commission, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ASPアフィリエイト管理</h1>
        <Link
          href="/admin/asp/advertisers/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          広告主を追加
        </Link>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">総コンバージョン</p>
          <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">総売上</p>
          <p className="text-2xl font-bold text-gray-900">&yen;{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">総コミッション</p>
          <p className="text-2xl font-bold text-indigo-600">&yen;{totalCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* 広告主一覧 */}
      <div>
        <h2 className="text-lg font-bold mb-3">広告主</h2>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ドメイン</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">APIキー</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">報酬率</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(advertisers as AspAdvertiser[] | null)?.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 text-gray-700">{a.domain}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.api_key.slice(0, 12)}...</td>
                  <td className="px-4 py-3 text-gray-700">{a.commission_rate}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.status === "有効" ? "bg-green-100 text-green-800"
                        : a.status === "審査中" ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}>{a.status}</span>
                  </td>
                </tr>
              ))}
              {(!advertisers || advertisers.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">広告主はまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* プログラム一覧 */}
      <div>
        <h2 className="text-lg font-bold mb-3">プログラム</h2>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">プログラム名</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">広告主</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">報酬タイプ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">報酬</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(programs as (AspProgram & { asp_advertisers: { name: string } | null })[] | null)?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-700">{p.asp_advertisers?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{p.commission_type}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.commission_rate ? `${p.commission_rate}%` : `¥${p.commission_amount.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.status === "募集中" ? "bg-green-100 text-green-800"
                        : p.status === "停止" ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {(!programs || programs.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">プログラムはまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* コンバージョン履歴 */}
      <div>
        <h2 className="text-lg font-bold mb-3">最近のコンバージョン</h2>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">プログラム</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">アフィリエイト</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">売上</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">報酬</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">日時</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(conversions as (AspConversion & { asp_programs: { name: string } | null })[] | null)?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{c.asp_programs?.name ?? "-"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.affiliate_code}</td>
                  <td className="px-4 py-3 text-right text-gray-900">&yen;{c.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-indigo-600 font-medium">&yen;{c.commission.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.status === "発生" ? "bg-blue-100 text-blue-800"
                        : c.status === "承認" ? "bg-green-100 text-green-800"
                        : c.status === "却下" ? "bg-red-100 text-red-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString("ja-JP")}</td>
                </tr>
              ))}
              {(!conversions || conversions.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">コンバージョンはまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 埋め込みコード */}
      <div>
        <h2 className="text-lg font-bold mb-3">外部サイト向け埋め込みコード</h2>
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-3">以下のスクリプトを広告主サイトのHTMLに追加してください：</p>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
{`<!-- CCAGI ASP トラッキング -->
<script src="${typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_BASE_URL || '' : ''}/api/asp/tracking.js"></script>
<script>
  CCAGI_ASP.init("PROGRAM_ID_HERE");
</script>

<!-- コンバージョン計測（購入完了ページに設置） -->
<script>
  CCAGI_ASP.trackConversion("ORDER_ID", AMOUNT, "API_KEY");
</script>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
