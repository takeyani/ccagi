export default function TrustProof() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-sm font-medium text-red-500 tracking-wider mb-3 text-center">
          WHY PROOF MATTERS
        </p>
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          インターネットは偽物だらけ。<br />
          だから<span className="text-blue-600">「証明」</span>が必要です
        </h2>
        <p className="text-gray-500 text-center text-sm max-w-2xl mx-auto mb-12">
          見た目だけのサイト、レビューの捏造、実在しない会社、品質の嘘。
          ネット上の情報は人間の目では本物と偽物を見分けられません。
          だからこそ、証拠に基づいた「証明」が唯一の解決策になります。
        </p>

        {/* ネットの現状 */}
        <div className="bg-white rounded-2xl border border-red-200 p-8 mb-10">
          <h3 className="font-bold text-gray-900 text-center mb-6">ネット通販で本当に起きていること</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🎭", title: "偽サイト", desc: "見た目はキレイなのに、会社が実在しない。お金を払っても商品が届かない。" },
              { icon: "⭐", title: "レビュー偽装", desc: "高評価レビューはお金で買える。星の数は品質を保証しない。" },
              { icon: "📦", title: "偽ブランド品", desc: "本物そっくりの偽物が正規品として流通。写真だけでは見分けがつかない。" },
              { icon: "📋", title: "成分・産地の嘘", desc: "「国産」「無添加」と書いてあっても、証明がなければただの自己申告。" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-red-500 mt-6 font-bold">
            人間の目では見分けられない → だからAIに判定させる → AIには「証明データ」が必要
          </p>
        </div>

        {/* 証明があると何が変わるか */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <h3 className="font-bold text-gray-900 text-center mb-6">証明があると何が変わるのか？</h3>
          <div className="space-y-4">
            {[
              {
                question: "購買エージェント（AI）はなぜ判定できるのか？",
                answer: "AIは「見た目」ではなく「データ」で判断します。営業許可証の有無、検査結果の数値、バーコード読み取りの記録、配送追跡番号。これらの構造化されたデータがあれば、AIは瞬時に「信頼できるかどうか」をスコア化できます。逆に言えば、証明データがない商品はAIが判定できない＝検索結果に表示されません。",
                icon: "🤖",
                color: "bg-blue-50 border-blue-200",
              },
              {
                question: "証明があることでなぜ安全なのか？",
                answer: "証明は「自己申告」ではなく「第三者が確認できる証拠」です。営業許可証は行政が発行し、検査結果は検査機関が出し、配送追跡は配送会社が記録します。嘘をつくことが構造的に困難な仕組みです。すべてのデータは改ざんできない形で記録されるため、「後から嘘に変える」こともできません。",
                icon: "🔒",
                color: "bg-green-50 border-green-200",
              },
              {
                question: "なぜ「選ばれる理由」を集められるのか？",
                answer: "証明は売り手にとって「他社との差別化」になります。同じ商品でも、証明が揃っている売り手はAIスコアが高くなり、検索結果の上位に表示されます。バイヤーは「なぜこの売り手を選んだか」を証明データに基づいて説明できるため、社内の購買稟議も通しやすくなります。証明＝選ばれる理由の積み重ねです。",
                icon: "📊",
                color: "bg-amber-50 border-amber-200",
              },
            ].map((item) => (
              <div key={item.question} className={`${item.color} border rounded-xl p-6`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{item.question}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 証明のフロー図 */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl p-8 text-white">
          <h3 className="font-bold text-center mb-6">証明がつくることで生まれる信頼の循環</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
            {[
              { step: "売り手が証明を登録", icon: "📋" },
              { step: "AIがスコアを算出", icon: "🤖" },
              { step: "高スコア商品が上位表示", icon: "📈" },
              { step: "バイヤーが安心して購入", icon: "🛒" },
              { step: "売り手の実績が積み上がる", icon: "⭐" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl mb-1">
                    {item.icon}
                  </div>
                  <p className="text-xs text-blue-100 max-w-[100px]">{item.step}</p>
                </div>
                {i < 4 && <span className="text-white/50 text-lg hidden sm:block">→</span>}
              </div>
            ))}
          </div>
          <p className="text-blue-200 text-xs text-center mt-6">
            証明が増えるほどスコアが上がり、売れるほど実績が積み上がる。
            この「信頼の循環」が、偽物を排除し本物だけが残る市場を作ります。
          </p>
        </div>
      </div>
    </section>
  );
}
