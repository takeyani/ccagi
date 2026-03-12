export default function ReferralPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <a href="/ccagi" className="text-xl font-bold tracking-tight">
            CCAGI
          </a>
          <a
            href="#contact"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
          >
            お問い合わせ
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-4">
            CCAGI Referral Program
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            紹介するだけで、
            <br />
            <span className="text-amber-600">最大20%の報酬。</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            CCAGIを紹介して収益を得る。ワークショップ受講から認定パートナーまで、
            あなたのレベルに合わせた紹介フィープログラム。
          </p>
        </div>
      </section>

      {/* 3 Tiers */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            3つの参加レベル
          </h2>
          <p className="text-center text-gray-500 mb-16">
            あなたに合ったレベルから始められます
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`rounded-2xl border-2 p-8 relative ${
                  tier.recommended
                    ? "border-amber-400 shadow-xl shadow-amber-100"
                    : "border-gray-200"
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      最も人気
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{tier.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-gray-500">{tier.subtitle}</p>
                </div>
                <div className="text-center mb-6">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-gray-500 text-sm ml-1">
                    {tier.priceUnit}
                  </span>
                </div>
                <div className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 mt-0.5 text-amber-500">
                        {f.included ? "+" : "-"}
                      </span>
                      <span
                        className={
                          f.included ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Fee highlight */}
                <div
                  className={`rounded-xl p-4 text-center ${
                    tier.recommended
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">直接紹介フィー</p>
                  <p
                    className={`text-3xl font-extrabold ${
                      tier.recommended ? "text-amber-600" : "text-gray-900"
                    }`}
                  >
                    {tier.directFee}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure Detail */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            紹介フィーの仕組み
          </h2>
          <p className="text-center text-gray-500 mb-12">
            紹介の連鎖で、継続的な収益が発生します
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500">
                    レベル
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 text-center">
                    直接紹介
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 text-center">
                    2次紹介
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 text-center">
                    3次紹介
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {feeTable.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {row.name}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {row.price}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-lg text-amber-600">
                        {row.direct}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`font-bold text-lg ${
                          row.second ? "text-amber-500" : "text-gray-300"
                        }`}
                      >
                        {row.second || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`font-bold text-lg ${
                          row.third ? "text-amber-500" : "text-gray-300"
                        }`}
                      >
                        {row.third || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Simulation */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            収益シミュレーション
          </h2>
          <p className="text-center text-gray-500 mb-12">
            認定パートナーが紹介した場合の収益例
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {simulations.map((sim, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 p-8 text-center"
              >
                <p className="text-sm text-gray-500 mb-2">{sim.scenario}</p>
                <p className="text-4xl font-extrabold text-amber-600 mb-2">
                  {sim.revenue}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {sim.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual: Referral Chain */}
      <section className="py-20 px-6 bg-amber-950 text-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            紹介の連鎖が生む継続収益
          </h2>
          <p className="text-center text-amber-200/60 mb-12">
            認定パートナーの場合 — 3階層の紹介フィー
          </p>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <div className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-6 py-4 w-full md:w-auto">
                <p className="font-bold text-amber-400 text-sm">あなた</p>
                <p className="text-xs text-amber-200/60 mt-1">認定パートナー</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-amber-400 font-bold text-sm">20%</span>
                <span className="text-amber-400/50 text-2xl">&rarr;</span>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 px-6 py-4 w-full md:w-auto">
                <p className="font-bold text-sm">紹介先A</p>
                <p className="text-xs text-gray-400 mt-1">CCAGI購入</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-amber-400 font-bold text-sm">5%</span>
                <span className="text-amber-400/50 text-2xl">&rarr;</span>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 px-6 py-4 w-full md:w-auto">
                <p className="font-bold text-sm">Aの紹介先B</p>
                <p className="text-xs text-gray-400 mt-1">CCAGI購入</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-amber-400 font-bold text-sm">5%</span>
                <span className="text-amber-400/50 text-2xl">&rarr;</span>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 px-6 py-4 w-full md:w-auto">
                <p className="font-bold text-sm">Bの紹介先C</p>
                <p className="text-xs text-gray-400 mt-1">CCAGI購入</p>
              </div>
            </div>
            <p className="text-center text-sm text-amber-200/40 mt-6">
              A・B・Cすべての購入に対して、あなたに紹介フィーが発生します
            </p>
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            始め方
          </h2>
          <p className="text-center text-gray-500 mb-12">
            3ステップで紹介パートナーに
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Council Review */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-400 tracking-widest uppercase mb-4">
              Certification Council
            </p>
            <h2 className="text-3xl font-bold mb-4">
              認定パートナーへの道
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              認定パートナーになるには、カスタマークラウド社の評議会による審査が必要です。
              技術力・ビジネス理解・倫理基準を総合的に評価し、
              CCAGIブランドにふさわしいパートナーのみを認定します。
            </p>
          </div>

          {/* Process Flow */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {councilSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-sm font-bold text-amber-400">{i + 1}</span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto">
              評議会は、CCAGIのエコシステムの品質と信頼性を維持するために設置されています。
              認定パートナーとして活動いただくことで、20%の紹介フィーに加え、
              カスタマークラウド社からの公式サポートと優先案件のご紹介も受けられます。
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            よくある質問
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-gray-200 p-6"
              >
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="py-20 px-6 bg-amber-600 text-white"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            CCAGIパートナーになりませんか？
          </h2>
          <p className="text-amber-100 mb-8">
            まずはワークショップから。30万円の受講で紹介パートナーとしての活動が始められます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@example.com?subject=CCAGIワークショップ申込"
              className="rounded-full bg-white text-amber-700 px-8 py-3 font-semibold hover:bg-amber-50 transition"
            >
              ワークショップに申し込む
            </a>
            <a
              href="mailto:contact@example.com?subject=CCAGI認定パートナー問合せ"
              className="rounded-full border border-white/40 px-8 py-3 font-semibold hover:bg-white/10 transition"
            >
              認定パートナーについて聞く
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
        <a href="/ccagi" className="text-gray-500 hover:text-gray-700">
          CCAGI トップページ
        </a>
        <span className="mx-2">&middot;</span>
        &copy; {new Date().getFullYear()} CCAGI. All rights reserved.
      </footer>
    </div>
  );
}

const tiers = [
  {
    icon: "🎓",
    name: "ワークショップ会員",
    subtitle: "まずはここから",
    price: "30",
    priceUnit: "万円",
    directFee: "5%",
    recommended: false,
    features: [
      { text: "CCAGIワークショップ受講", included: true },
      { text: "直接紹介フィー 5%", included: true },
      { text: "2次紹介フィー", included: false },
      { text: "3次紹介フィー", included: false },
    ],
  },
  {
    icon: "🚀",
    name: "ユーザー",
    subtitle: "CCAGIを使いながら紹介",
    price: "CCAGI",
    priceUnit: "購入",
    directFee: "15%",
    recommended: true,
    features: [
      { text: "CCAGI製品の利用権", included: true },
      { text: "直接紹介フィー 15%", included: true },
      { text: "2次紹介フィー 5%", included: true },
      { text: "3次紹介フィー", included: false },
    ],
  },
  {
    icon: "👑",
    name: "認定パートナー",
    subtitle: "最大報酬 + 3階層",
    price: "130",
    priceUnit: "万円（WS込）",
    directFee: "20%",
    recommended: false,
    features: [
      { text: "CCAGIワークショップ受講（30万円分込）", included: true },
      { text: "CCAGI認定プログラム修了", included: true },
      { text: "直接紹介フィー 20%", included: true },
      { text: "2次紹介フィー 5%", included: true },
      { text: "3次紹介フィー 5%", included: true },
      { text: "カスタマークラウド社 評議会の審査あり", included: true },
    ],
  },
];

const feeTable = [
  {
    name: "ワークショップ会員",
    price: "30万円",
    direct: "5%",
    second: null,
    third: null,
  },
  {
    name: "ユーザー",
    price: "CCAGI購入",
    direct: "15%",
    second: "5%",
    third: null,
  },
  {
    name: "認定パートナー",
    price: "130万円",
    direct: "20%",
    second: "5%",
    third: "5%",
  },
];

const simulations = [
  {
    scenario: "認定パートナーが1人紹介",
    revenue: "26万円",
    detail: "CCAGI 130万円 × 20% = 26万円の紹介フィー",
  },
  {
    scenario: "紹介先がさらに1人紹介",
    revenue: "+6.5万円",
    detail: "2次紹介: 130万円 × 5% = 6.5万円が追加で発生",
  },
  {
    scenario: "3次紹介まで各1人ずつ",
    revenue: "合計 39万円",
    detail:
      "直接26万円 + 2次6.5万円 + 3次6.5万円 = 39万円（3人の連鎖で回収率30%）",
  },
];

const steps = [
  {
    title: "ワークショップ受講",
    desc: "CCAGIの機能・活用法を学ぶワークショップ（30万円）を受講。紹介パートナーとしての基礎を身につけます。",
  },
  {
    title: "CCAGIを紹介",
    desc: "あなたのネットワークにCCAGIを紹介。ワークショップ・製品購入・認定のいずれでも紹介フィーが発生します。",
  },
  {
    title: "継続収益を得る",
    desc: "紹介先がさらに紹介することで、2次・3次の紹介フィーが継続的に発生。認定パートナーなら3階層まで対象。",
  },
];

const councilSteps = [
  {
    title: "申請",
    desc: "認定パートナープログラムに申請。経歴・実績・活動計画を提出。",
  },
  {
    title: "書類審査",
    desc: "カスタマークラウド社が技術力・ビジネス理解・倫理基準を審査。",
  },
  {
    title: "評議会審査",
    desc: "評議会メンバーによる最終審査。面談を含む総合的な評価。",
  },
  {
    title: "認定",
    desc: "審査通過後、正式に認定パートナーとして活動開始。20%+3階層が適用。",
  },
];

const faqs = [
  {
    q: "ワークショップだけでも紹介フィーは発生しますか？",
    a: "はい。ワークショップ（30万円）を受講するだけで、直接紹介に対して5%の紹介フィーが発生します。",
  },
  {
    q: "認定パートナーの130万円にはワークショップ代が含まれますか？",
    a: "はい。認定パートナー費用130万円のうち、30万円はワークショップ受講費用として含まれています。",
  },
  {
    q: "2次紹介・3次紹介とは何ですか？",
    a: "あなたが紹介した方（1次）がさらに別の方を紹介した場合が2次紹介です。認定パートナーの場合、さらにその先の紹介（3次）まで紹介フィーが発生します。",
  },
  {
    q: "紹介フィーはいつ支払われますか？",
    a: "紹介先の支払い確認後、翌月末にお振込みいたします。詳細は個別にご案内します。",
  },
  {
    q: "ユーザーから認定パートナーにアップグレードできますか？",
    a: "はい。差額をお支払いいただくことで認定パートナーにアップグレード可能です。ただし、カスタマークラウド社の評議会による審査が必要となります。",
  },
  {
    q: "評議会の審査ではどのような点が評価されますか？",
    a: "技術力・CCAGIへの理解度・ビジネス実績・倫理基準を総合的に評価します。CCAGIブランドの品質と信頼性を維持するための審査です。",
  },
  {
    q: "評議会の審査に落ちた場合はどうなりますか？",
    a: "ユーザーレベル（直接15% + 2次5%）での活動は引き続き可能です。フィードバックを基に再申請いただくことも可能です。",
  },
];
