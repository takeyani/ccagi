const features = [
  {
    icon: "💰",
    title: "初期費用0円・成果報酬12%のみ",
    description:
      "初期費用0円・月額0円。商品が売れた時だけ12%の手数料が発生する成果報酬型。売上ゼロならコストもゼロ。リスクなく始められます。",
    highlight: true,
  },
  {
    icon: "🛡️",
    title: "5層プルーフチェーン",
    description:
      "L1〜L5の多層認証で商品の品質・安全性を証明。バイヤーが安心して購入でき、選ばれる理由になります。",
  },
  {
    icon: "📦",
    title: "箱・ケース・パレット単位で販売",
    description:
      "個単位はもちろん、箱（24個入）やケース、パレット単位での販売に対応。最小注文数も設定可能で、BtoB取引にも最適。",
  },
  {
    icon: "🤖",
    title: "AIエージェント購入",
    description:
      "バイヤーが条件（認証・成分・スペック）を設定すると、AIが最適な商品を自動で検索・提案します。",
  },
  {
    icon: "🎨",
    title: "LP作成ツール",
    description:
      "メーカーから販売許可を取得し、卸値に利益を乗せたLPをノーコードで作成。差分がクリエイターの利益に。",
  },
  {
    icon: "💳",
    title: "Stripe決済連携",
    description:
      "セキュアなStripe決済でスムーズに取引完了。Stripe Connectによるメーカーへの自動送金にも対応。",
  },
  {
    icon: "🔐",
    title: "商品承認フロー",
    description:
      "メーカーが代理店やクリエイターに販売・LP作成の権限を付与。代理店側からの承認リクエストにも対応する双方向フロー。",
  },
  {
    icon: "🔑",
    title: "Google / メール認証",
    description:
      "Googleアカウントまたはメール・パスワードで簡単ログイン。メーカー・代理店・バイヤー・クリエイターそれぞれ専用の画面を用意。",
  },
  {
    icon: "📊",
    title: "LPアクセス分析",
    description:
      "商品ページやクリエイターLPの閲覧数・コンバージョンをリアルタイムで分析。マーケティング施策の効果を可視化。",
  },
  {
    icon: "📨",
    title: "ステップメール",
    description:
      "購入後やサインアップ後に自動でフォローメールを配信。リピート購入やエンゲージメントを促進します。",
  },
  {
    icon: "🔨",
    title: "オークション機能",
    description:
      "即決価格付きオークションで在庫を効率的に販売。自動入札やAIエージェント入札にも対応。",
  },
  {
    icon: "🏢",
    title: "グループウェア",
    description:
      "お知らせ・メッセージ・タスク管理・ファイル共有・カレンダー・活動ログなど、パートナー間のコラボレーション機能を完備。",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          選ばれる理由
        </h2>
        <p className="mt-4 text-center text-gray-600">
          成果報酬型だから、リスクゼロで始められます
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`rounded-2xl p-8 text-center shadow-sm transition hover:shadow-md ${
                i === 0
                  ? "sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-indigo-400 shadow-lg"
                  : "border border-gray-100 bg-gray-50"
              }`}
            >
              <div className={`mb-4 ${i === 0 ? "text-5xl" : "text-4xl"}`}>{feature.icon}</div>
              <h3 className={`font-semibold ${i === 0 ? "text-2xl" : "text-xl text-gray-900"}`}>
                {feature.title}
              </h3>
              <p className={`mt-3 leading-relaxed ${i === 0 ? "text-indigo-100 text-lg" : "text-gray-600"}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
