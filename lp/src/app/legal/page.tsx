import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | 単品決済ロットLP",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">&larr; トップページに戻る</Link>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                ["販売業者", "株式会社XXXカンパニー"],
                ["代表責任者", "山田 太郎"],
                ["所在地", "〒100-0001 東京都千代田区千代田1-1-1 XXXビル 5F"],
                ["電話番号", "03-XXXX-XXXX（平日 10:00〜18:00）"],
                ["メールアドレス", "info@example.com"],
                ["URL", "https://lot-lp.vercel.app"],
                ["販売価格", "各商品ページに記載の価格（税抜表示）"],
                ["商品代金以外の必要料金", "消費税、振込手数料（お客様負担）、送料（別途表示）"],
                ["支払方法", "クレジットカード決済（Stripe）"],
                ["支払時期", "注文確定時に即時決済"],
                ["商品の引き渡し時期", "決済完了後、出荷準備完了次第発送（通常3〜7営業日）"],
                ["返品・交換について", "商品到着後7日以内に限り、未開封・未使用の場合のみ返品を受け付けます。不良品の場合は送料当社負担にて交換いたします。"],
                ["返品送料", "お客様都合の場合：お客様負担 / 不良品の場合：当社負担"],
                ["動作環境", "本サービスはWebブラウザ上で動作します。推奨環境：Chrome、Safari、Firefox、Edge の最新版"],
                ["サービス利用料", "初期費用 0円 / 月額費用 0円 / 成果報酬 12%（売上発生時のみ）"],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-0">
                  <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-700 w-1/3 align-top">{label}</th>
                  <td className="px-6 py-4 text-gray-600">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          ※ 上記は表示例です。実際の運営情報は正式な事業者情報に置き換えてください。
        </p>
      </div>
    </div>
  );
}
