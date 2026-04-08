import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Cross Infinity",
};

const sections = [
  {
    title: "1. 個人情報の定義",
    content:
      "本ポリシーにおいて「個人情報」とは、生存する個人に関する情報であって、氏名、メールアドレス、住所、電話番号、その他の記述等により特定の個人を識別できるものを指します。",
  },
  {
    title: "2. 個人情報の収集",
    content:
      "当社は、以下の場合に個人情報を収集することがあります。\n・アカウント登録時（氏名、メールアドレス、会社名等）\n・商品購入時（配送先住所、決済情報等）\n・お問い合わせ時（氏名、メールアドレス、お問い合わせ内容）\n・アフィリエイト登録時（氏名、メールアドレス）",
  },
  {
    title: "3. 個人情報の利用目的",
    content:
      "収集した個人情報は、以下の目的で利用いたします。\n・サービスの提供・運営\n・商品の発送・決済処理\n・お問い合わせへの対応\n・サービスの改善・新機能の開発\n・利用規約に違反する行為への対応\n・メンテナンス等の重要なお知らせ",
  },
  {
    title: "4. 個人情報の第三者提供",
    content:
      "当社は、以下の場合を除き、第三者に個人情報を提供いたしません。\n・ご本人の同意がある場合\n・法令に基づく場合\n・人の生命・身体・財産の保護に必要な場合\n・決済処理のためにStripe, Inc.に提供する場合\n・配送業者への配送先情報の提供",
  },
  {
    title: "5. 個人情報の管理",
    content:
      "当社は、個人情報の正確性を保ち、不正アクセス・紛失・破壊・改ざん・漏洩を防止するため、適切なセキュリティ対策を講じます。データはSSL/TLSにより暗号化され、Supabase上で安全に管理されます。",
  },
  {
    title: "6. Cookieの使用",
    content:
      "当サービスでは、ログイン状態の維持やアフィリエイトトラッキングのためにCookieを使用しています。ブラウザの設定によりCookieを無効にすることも可能ですが、一部機能が制限される場合があります。",
  },
  {
    title: "7. 個人情報の開示・訂正・削除",
    content:
      "ご本人から個人情報の開示・訂正・削除のご請求があった場合、合理的な期間内に対応いたします。ご請求は下記のお問い合わせ先までご連絡ください。",
  },
  {
    title: "8. ポリシーの変更",
    content:
      "本ポリシーは、法令の変更やサービス内容の変更に伴い、予告なく改定する場合があります。改定後のポリシーは本ページに掲載した時点で効力を生じます。",
  },
  {
    title: "9. お問い合わせ",
    content:
      "個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。\n\n株式会社XXXカンパニー 個人情報管理責任者\nメール: privacy@example.com\n電話: 03-XXXX-XXXX（平日 10:00〜18:00）",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">&larr; トップページに戻る</Link>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mb-8">最終更新日: 2026年3月15日</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            株式会社XXXカンパニー（以下「当社」）は、Cross Infinityサービス（以下「本サービス」）における
            お客様の個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-base font-bold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          ※ 上記は表示例です。実際の運営時は法務確認の上、正式な内容に置き換えてください。
        </p>
      </div>
    </div>
  );
}
