import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "はじめてガイド" };

const roles = [
  {
    role: "メーカー",
    icon: "🏭",
    steps: [
      { label: "アカウント登録", desc: "メーカーとして新規登録", href: "/signup?role=maker", cta: "メーカー登録" },
      { label: "商品登録", desc: "商品情報・画像・価格を登録（CSV一括登録も可能）", href: "/partner/products/new", cta: "商品を登録" },
      { label: "ロット作成", desc: "在庫数・販売単位・配送方法を設定", href: "/partner/lots/new", cta: "ロットを作成" },
      { label: "販売開始", desc: "商品ページが公開され購入可能に", href: null, cta: null },
    ],
  },
  {
    role: "販売代理店",
    icon: "🏢",
    steps: [
      { label: "アカウント登録", desc: "代理店として新規登録", href: "/signup?role=agent", cta: "代理店登録" },
      { label: "商品承認リクエスト", desc: "メーカーに販売許可を申請", href: "/partner/authorizations", cta: "承認リクエスト" },
      { label: "メーカー承認待ち", desc: "メーカーが承認すると販売可能に", href: null, cta: null },
      { label: "ロット作成・販売開始", desc: "自社の価格・在庫を設定して販売", href: "/partner/lots/new", cta: "ロットを作成" },
    ],
  },
  {
    role: "クリエイター",
    icon: "🎨",
    steps: [
      { label: "アフィリエイト登録", desc: "クリエイターとして登録（Googleでも可）", href: "/affiliate", cta: "クリエイター登録" },
      { label: "コードでログイン", desc: "発行されたコードでクリエイターポータルへ", href: "/creator", cta: "ポータルへ" },
      { label: "LP作成", desc: "テンプレートを選んでLPを作成・編集", href: "/creator/designs/new", cta: "LP作成" },
      { label: "公開・共有", desc: "SNSやブログでLPを共有して収益化", href: null, cta: null },
    ],
  },
  {
    role: "バイヤー",
    icon: "🛒",
    steps: [
      { label: "アカウント登録", desc: "バイヤーとして新規登録", href: "/signup?role=buyer", cta: "バイヤー登録" },
      { label: "購買エージェント作成", desc: "条件を設定してAIが自動検索", href: "/buyer/agents/new", cta: "エージェント作成" },
      { label: "結果確認・注文", desc: "スコアリング結果から注文を送信", href: null, cta: null },
      { label: "購入", desc: "Stripe Checkout で安全に決済", href: null, cta: null },
    ],
  },
];

export default function StartGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Image src="/logo.png" alt="Cross Infinity" width={64} height={64} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">はじめてガイド</h1>
          <p className="mt-2 text-gray-500">あなたの立場に合わせた登録・利用の流れをご案内します</p>
        </div>

        <div className="space-y-8">
          {roles.map((r) => (
            <section key={r.role} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-orange-50/40 border-b">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">{r.icon}</span>
                  {r.role}の方
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {r.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100/60 text-orange-700 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{step.label}</p>
                        <p className="text-sm text-gray-500">{step.desc}</p>
                      </div>
                      {step.href && step.cta && (
                        <Link
                          href={step.href}
                          className="shrink-0 text-xs font-medium text-orange-600 border border-orange-300 rounded-lg px-3 py-1.5 hover:bg-orange-50/40 transition"
                        >
                          {step.cta} &rarr;
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 text-center space-y-3">
          <Link href="/guide/referral" className="inline-block text-sm text-orange-600 hover:underline">
            紹介して報酬を得る方法 &rarr;
          </Link>
          <br />
          <Link href="/" className="inline-block text-sm text-gray-500 hover:text-gray-700">
            &larr; トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
