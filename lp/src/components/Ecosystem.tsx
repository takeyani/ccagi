export default function Ecosystem() {
  return (
    <section className="bg-slate-900 text-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-sm font-medium text-blue-400 tracking-wider mb-3 text-center">
          NOT JUST BUYING — EVERYONE CAN SELL
        </p>
        <h2 className="text-center text-3xl font-bold sm:text-4xl mb-4">
          買うだけのECじゃない。<br />
          <span className="text-blue-400">あらゆる人が売れる</span>プラットフォーム
        </h2>
        <p className="text-gray-400 text-center text-sm max-w-2xl mx-auto mb-12">
          従来のECは「買い手」と「売り手」が固定されていました。
          このプラットフォームでは、メーカー・販売代理店・クリエイター・バイヤー、
          すべての参加者が「売る側」にもなれる環境を構築しています。
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              role: "メーカー",
              icon: "🏭",
              color: "from-blue-600 to-blue-700",
              sells: "自社商品を直接出品",
              gets: "クリエイター・販売代理店が自動で販路を広げてくれる。購買AIに発見されるので営業不要。",
            },
            {
              role: "販売代理店",
              icon: "🏢",
              color: "from-purple-600 to-purple-700",
              sells: "メーカー商品を独自価格で販売",
              gets: "在庫リスクなしで商品を扱える。LP作成ツールで独自の販売チャネルを構築。",
            },
            {
              role: "クリエイター",
              icon: "🎨",
              color: "from-pink-500 to-pink-600",
              sells: "メーカー許可を得てLPで販売",
              gets: "仕入れ不要。卸値に利益を乗せて売るだけ。SNSのフォロワーを収益に変える。",
            },
            {
              role: "バイヤー",
              icon: "🛒",
              color: "from-emerald-600 to-emerald-700",
              sells: "購入品を所有権履歴付きで再出品",
              gets: "L4プルーフで正規ルートが証明された状態で転売可能。信頼の連鎖が途切れない。",
            },
          ].map((item) => (
            <div key={item.role} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className={`bg-gradient-to-r ${item.color} px-4 py-3 flex items-center gap-2`}>
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold text-sm">{item.role}</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 mb-0.5">何を売れるか</p>
                  <p className="text-xs text-gray-300">{item.sells}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 mb-0.5">参入するメリット</p>
                  <p className="text-xs text-gray-400">{item.gets}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 従来ECとの違い */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-5">
            <h4 className="font-bold text-red-400 text-sm mb-3">従来のEC</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 買い手と売り手が固定</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 売り手はメーカーか大手小売だけ</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 個人が商品を仕入れて販売は難しい</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 転売は信頼性に疑問</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 営業マンが動かないと売れない</li>
            </ul>
          </div>
          <div className="bg-green-950/30 border border-green-800/30 rounded-xl p-5">
            <h4 className="font-bold text-green-400 text-sm mb-3">単品決済ロットLP</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 全員が売り手にも買い手にもなれる</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> クリエイターが動画1本で販売を開始</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 仕入れ不要・卸値との差分が利益</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> L4プルーフで転売ルートが透明</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 購買AI・販売AIが24時間自動で取引</li>
            </ul>
          </div>
        </div>

        <p className="text-gray-500 text-xs text-center mt-8">
          メーカーと組める環境を構築することで、
          あらゆる参加者が「売る力」を手に入れます。
          プルーフチェーンがその信頼の基盤です。
        </p>
      </div>
    </section>
  );
}
