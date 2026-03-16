import Link from "next/link";

const useCases = [
  {
    emoji: "👴",
    title: "余命宣告を受けた祖父から孫へ",
    description: "10歳の孫の20歳の誕生日に届く、おじいちゃんからのお祝いページ。手紙、写真、動画を詰め込んだ世界に一つだけのページが届く。",
    delivery: "10年後の誕生日",
  },
  {
    emoji: "👨",
    title: "父から娘の結婚式へ",
    description: "「結婚おめでとう」の手紙と家族写真、幼い頃の映像を一つのページに。もしもの時にも、あなたの想いは届きます。",
    delivery: "結婚式の日",
  },
  {
    emoji: "👩",
    title: "母から子供の卒業式へ",
    description: "入学式の写真、応援メッセージの動画、手書きの手紙の画像。すべてを一つのページにまとめて卒業の日に届ける。",
    delivery: "卒業式の日",
  },
  {
    emoji: "💑",
    title: "夫婦の記念日に",
    description: "出会った日の写真、思い出の動画、感謝の言葉。毎年の結婚記念日に届くサプライズページ。",
    delivery: "毎年の記念日",
  },
  {
    emoji: "👶",
    title: "生まれたばかりの赤ちゃんへ",
    description: "生まれた日の写真、家族からの動画メッセージ、手紙をまとめたページを20歳の誕生日に届ける。タイムカプセル。",
    delivery: "20歳の誕生日",
  },
  {
    emoji: "🎓",
    title: "自分自身の未来へ",
    description: "今の決意、目標、写真。1年後・5年後の自分に向けたメッセージページ。",
    delivery: "指定した未来の日",
  },
];

const pageBlocks = [
  { icon: "📝", name: "テキスト", desc: "手紙・メッセージ・詩" },
  { icon: "📸", name: "写真", desc: "JPEG/PNG/WebP" },
  { icon: "🖼️", name: "画像", desc: "イラスト・手書き文字" },
  { icon: "🎬", name: "動画", desc: "MP4/YouTube/Vimeo" },
  { icon: "🎵", name: "音声", desc: "ボイスメッセージ" },
  { icon: "📷", name: "ギャラリー", desc: "複数写真をスライド表示" },
];

const steps = [
  {
    number: "01",
    title: "メッセージページを作成",
    description: "文章、写真、画像、動画を自由に組み合わせて、世界に一つだけのメッセージページを作成します。ブロックを並べるだけの簡単操作。",
    icon: "🎨",
  },
  {
    number: "02",
    title: "届け先と届ける日を設定",
    description: "届けたい相手のメールアドレス（TO/CC対応）と、届ける日時を指定。1ヶ月後でも10年後でも届きます。",
    icon: "📅",
  },
  {
    number: "03",
    title: "データ保管料をお支払い",
    description: "1日たった10円。届ける日までページと全メディアデータを安全に保管します。お支払いはクレジットカードで。",
    icon: "💳",
  },
  {
    number: "04",
    title: "指定の日にリンク＆QRコードが届く",
    description: "設定した日時に、メッセージページへのリンクとQRコードがメールで届きます。受け取った人はリンクを開くだけで、あなたの想いに触れられます。",
    icon: "💌",
  },
];

const pricingExamples = [
  { period: "1ヶ月後", days: 30, cost: "300" },
  { period: "1年後", days: 365, cost: "3,650" },
  { period: "5年後", days: 1825, cost: "18,250" },
  { period: "10年後", days: 3650, cost: "36,500" },
  { period: "20年後", days: 7300, cost: "73,000" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            <span className="text-amber-500">&#9201;</span> 未来予約
          </span>
          <nav className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">料金</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">使い方</a>
            <Link
              href="/register"
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600 transition"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white pt-32 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, rgba(251,191,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(251,191,36,0.2) 0%, transparent 50%)" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-6">
            Future Message Page Delivery
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            大切な人へ、
            <br />
            <span className="text-amber-400">未来に届ける</span>メッセージ
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
            文章、写真、画像、映像を組み合わせたメッセージページを作成。
            <br />
            指定した未来の日に、リンクとQRコードをメールで届けます。
            <br />
            <span className="text-amber-300 font-medium">たとえ、あなたがその場にいられなくても。</span>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block rounded-full bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600 hover:shadow-xl"
            >
              メッセージページを作る
            </Link>
            <Link
              href="/flow"
              className="inline-block rounded-full border-2 border-white/30 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
            >
              サービスフロー &amp; 活用シーン
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            1日たった<span className="text-amber-400 font-bold text-base">10円</span>のデータ保管料で、あなたの想いを守ります
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-amber-50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4">STORY</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
            「おじいちゃんからの手紙が届いた」
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-8 text-left">
            <p className="text-gray-700 leading-loose text-sm">
              余命半年と告げられた70歳のおじいちゃん。
              <br /><br />
              10歳の孫の顔を見ながら思った。
              <br />
              「この子が成人する姿を見届けたかった」
              <br /><br />
              でも、<span className="font-bold text-amber-700">未来予約</span>があれば、想いを届けられる。
              <br /><br />
              おじいちゃんは、スマートフォンでメッセージページを作った。
              <br />
              孫への手紙。一緒に撮った写真。「おめでとう」と語りかける動画。
              <br />
              すべてを一つのページにまとめて、10年後の孫の20歳の誕生日に届くよう設定した。
              <br /><br />
              <span className="text-lg font-bold text-gray-900 italic">
                「20歳のお誕生日おめでとう。おじいちゃんは、ずっと君を見守っているよ。」
              </span>
              <br /><br />
              10年後の誕生日の朝、孫のメールにリンクとQRコードが届く。
              <br />
              開くと、そこにはおじいちゃんの字、笑顔、声がある。
              <br />
              もう会えない人からの、最後のプレゼント。
            </p>
          </div>
        </div>
      </section>

      {/* What You Can Create */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">PAGE BUILDER</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            想いを自由に詰め込めるページ
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            ブロックを組み合わせて、世界に一つだけのメッセージページを作成
          </p>

          {/* Page Blocks */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-10">
            {pageBlocks.map((block) => (
              <div key={block.name} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-2xl mb-2">
                  {block.icon}
                </div>
                <p className="text-sm font-bold text-gray-900">{block.name}</p>
                <p className="text-[10px] text-gray-400">{block.desc}</p>
              </div>
            ))}
          </div>

          {/* Page Mockup */}
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-t-2xl px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 text-center">
                mirai-yoyaku.app/m/abc123
              </div>
            </div>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl p-6 space-y-4">
              {/* Hero block */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 text-center">
                <p className="text-2xl font-extrabold text-gray-900">20歳のお誕生日おめでとう</p>
                <p className="text-sm text-gray-500 mt-1">おじいちゃんより</p>
              </div>
              {/* Text block */}
              <div className="text-sm text-gray-700 leading-relaxed">
                <p>大輝へ</p>
                <p className="mt-2">20歳の誕生日おめでとう。おじいちゃんがこの手紙を書いているのは、君がまだ10歳の時です。立派に成人を迎えた君を、とても誇りに思います...</p>
              </div>
              {/* Photo block */}
              <div className="grid grid-cols-2 gap-2">
                <div className="h-20 bg-amber-50 rounded-lg flex items-center justify-center text-2xl border border-amber-200">📸</div>
                <div className="h-20 bg-amber-50 rounded-lg flex items-center justify-center text-2xl border border-amber-200">📸</div>
              </div>
              {/* Video block */}
              <div className="bg-gray-900 rounded-xl h-28 flex items-center justify-center relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                </div>
                <p className="absolute bottom-2 right-3 text-white/50 text-[10px]">3:24</p>
              </div>
              {/* Message */}
              <div className="text-center text-sm text-gray-500 italic">
                &ldquo;ずっと見守っているよ&rdquo;
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">メッセージページのイメージ</p>
        </div>
      </section>

      {/* Delivery Method */}
      <section className="py-16 bg-amber-50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">届け方</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-amber-200 p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="font-bold text-gray-900 mb-2">リンクで届く</h3>
              <p className="text-sm text-gray-600">指定日にメールでメッセージページのURLを送信。TO/CC複数宛先に対応。クリックするだけで開けます。</p>
            </div>
            <div className="bg-white rounded-2xl border border-amber-200 p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">QRコードで届く</h3>
              <p className="text-sm text-gray-600">メールにQRコード画像も添付。スマートフォンで読み取ればすぐにページを表示。印刷してギフトに添えることも。</p>
            </div>
          </div>
          <div className="mt-6 max-w-lg mx-auto bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">届くメールのイメージ</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p className="text-gray-400"><span className="font-medium text-gray-600">From:</span> 未来予約 &lt;delivery@mirai-yoyaku.app&gt;</p>
              <p className="text-gray-400"><span className="font-medium text-gray-600">To:</span> daiki@example.com</p>
              <p className="text-gray-400"><span className="font-medium text-gray-600">CC:</span> family@example.com</p>
              <p className="text-gray-400"><span className="font-medium text-gray-600">件名:</span> おじいちゃんからのメッセージが届きました</p>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <p className="text-gray-700">大輝さんへ<br />大切な方からのメッセージページが届きました。</p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="inline-block bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold">メッセージを開く</span>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-[8px] text-gray-400 border">QR Code</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">USE CASES</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            こんなシーンで使われています
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            大切な人への想いを、最高のタイミングで届ける
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div className="text-4xl mb-3">{uc.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{uc.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">&#9201;</span>
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{uc.delivery}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">HOW IT WORKS</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            たった4ステップで未来に届く
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            スマートフォンがあれば、今すぐ始められます
          </p>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl shadow-lg">
                  {step.icon}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">STEP {step.number}</span>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">PRICING</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            シンプルな料金体系
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            登録料・初期費用は無料。データ保管料のみ
          </p>

          {/* Main Pricing Card */}
          <div className="max-w-md mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl mb-10">
            <div className="text-center">
              <p className="text-amber-200 text-sm font-medium mb-2">データ保管料</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-6xl font-extrabold">10</span>
                <span className="text-2xl font-bold mb-2">円/日</span>
              </div>
              <p className="mt-3 text-amber-100 text-sm">
                1ページあたり。届ける日まで全データを安全に保管
              </p>
              <div className="mt-6 bg-white/20 rounded-xl p-4">
                <p className="text-sm font-medium">含まれる機能</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-left text-sm">
                  {[
                    "ページ作成・編集",
                    "文章・写真・動画",
                    "メール配信（TO/CC）",
                    "QRコード生成",
                    "配信日時の指定",
                    "暗号化保管",
                    "事前配信確認",
                    "メディア差替え",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <span className="text-amber-200">&#10003;</span>
                      <span className="text-white/90">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Examples */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-lg mx-auto">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900 text-sm text-center">料金シミュレーション</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">届ける時期</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">保管日数</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">合計料金</th>
                </tr>
              </thead>
              <tbody>
                {pricingExamples.map((ex) => (
                  <tr key={ex.period} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium text-gray-900">{ex.period}</td>
                    <td className="px-6 py-3 text-right text-gray-600">{ex.days.toLocaleString()}日</td>
                    <td className="px-6 py-3 text-right font-bold text-amber-600">&yen;{ex.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            ※ 料金は税込表示です。お支払いはクレジットカード（Stripe）にて。
          </p>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">FUTURE VISION</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
            メッセージだけでなく、<span className="text-amber-400">贈り物</span>も未来に届ける
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto mb-10">
            将来的には、メッセージページに商品ギフトも連動させる「商品連動型」への拡張を予定しています。
            おじいちゃんが孫に贈る腕時計。お母さんが娘に届けるジュエリー。
            メッセージページと一緒に、形のある贈り物も未来に届けます。
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-3xl mb-3">📄</div>
              <h4 className="font-bold text-sm mb-2">Phase 1 - メッセージページ</h4>
              <p className="text-xs text-gray-400">文章・写真・動画を組み合わせたページを作成。指定日にリンク＆QRコードをメール配信。</p>
              <span className="inline-block mt-3 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Now</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-3xl mb-3">🎁</div>
              <h4 className="font-bold text-sm mb-2">Phase 2 - 商品連動型</h4>
              <p className="text-xs text-gray-400">メッセージページと一緒に商品ギフトも指定日に届ける。ECと連携した贈り物体験。</p>
              <span className="inline-block mt-3 text-xs font-medium text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-3xl mb-3">&#129302;</div>
              <h4 className="font-bold text-sm mb-2">Phase 3 - AI思い出アルバム</h4>
              <p className="text-xs text-gray-400">写真・動画からAIが自動でストーリー仕立ての思い出アルバムを生成。感動的な演出を。</p>
              <span className="inline-block mt-3 text-xs font-medium text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">Planned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">大切な想いを、安全に守ります</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "🔒", title: "暗号化保管", desc: "すべてのデータはAES-256で暗号化。安全なクラウドストレージで長期保管します。" },
              { icon: "🔄", title: "冗長バックアップ", desc: "複数のデータセンターに分散保管。10年後、20年後もデータの消失リスクをゼロに。" },
              { icon: "📧", title: "確実な配信", desc: "配信日の前に事前確認メールを送信。届け先アドレスの有効性を確認してから届けます。" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            あなたの想いを、未来に届けませんか？
          </h2>
          <p className="text-amber-100 text-sm mb-8 leading-relaxed">
            1日10円で、文章・写真・映像をまとめたメッセージページを守り続けます。
            <br />
            今日作ったページが、10年後の感動になる。
          </p>
          <Link
            href="/register"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-bold text-amber-600 shadow-lg transition hover:bg-gray-100 hover:shadow-xl"
          >
            無料で登録する
          </Link>
          <p className="mt-4 text-sm text-amber-200">
            アカウント登録は無料。ページ作成時にデータ保管料が発生します。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} 未来予約. All rights reserved.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-6">
            <Link href="/legal" className="transition hover:text-gray-700">特定商取引法に基づく表記</Link>
            <Link href="/privacy" className="transition hover:text-gray-700">プライバシーポリシー</Link>
            <a href="#how-it-works" className="transition hover:text-gray-700">使い方</a>
            <a href="#pricing" className="transition hover:text-gray-700">料金</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
