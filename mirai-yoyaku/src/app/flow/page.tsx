import Link from "next/link";

const serviceFlows = [
  {
    number: "01",
    title: "メッセージページを作成",
    description:
      "文章、写真、画像、動画を自由に組み合わせて、世界に一つだけのメッセージページを作成。ブロックを並べるだけの簡単操作。",
    icon: "🎨",
  },
  {
    number: "02",
    title: "届け先・届ける日・商品を設定",
    description:
      "届けたい相手のメールアドレス（TO/CC対応）と届ける日時を指定。商品連動型では、メーカーから届ける商品も選択できます。",
    icon: "📅",
  },
  {
    number: "03",
    title: "データ保管料をお支払い",
    description:
      "メッセージページは1日10円のデータ保管料。商品連動型の場合は商品代金も合わせてお支払い。Stripe決済で安全に処理。",
    icon: "💳",
  },
  {
    number: "04",
    title: "指定の日にリンク＆QRコード＋商品が届く",
    description:
      "設定した日時にメッセージページへのリンクとQRコードがメールで届きます。商品連動型では、メーカーから直接商品も届きます。",
    icon: "💌",
  },
];

const messageNeeds = [
  {
    emoji: "👴",
    title: "余命宣告を受けた祖父から孫へ",
    description:
      "10歳の孫の20歳の誕生日に届く、おじいちゃんからのお祝いページ。手紙、写真、動画を詰め込んだ世界に一つだけのページ。",
    delivery: "10年後の誕生日",
    category: "message",
  },
  {
    emoji: "👨",
    title: "父から娘の結婚式へ",
    description:
      "「結婚おめでとう」の手紙と家族写真、幼い頃の映像を一つのページに。もしもの時にも、あなたの想いは届きます。",
    delivery: "結婚式の日",
    category: "message",
  },
  {
    emoji: "👶",
    title: "生まれたばかりの赤ちゃんへ",
    description:
      "生まれた日の写真、家族からの動画メッセージ、手紙をまとめたページを20歳の誕生日に届けるタイムカプセル。",
    delivery: "20歳の誕生日",
    category: "message",
  },
  {
    emoji: "🎓",
    title: "自分自身の未来へ",
    description:
      "今の決意、目標、写真。1年後・5年後の自分に向けたメッセージページ。未来の自分への手紙。",
    delivery: "指定した未来の日",
    category: "message",
  },
];

const productNeeds = [
  {
    emoji: "🎍",
    title: "お歳暮・お中元の予約",
    description:
      "半年先のお歳暮・お中元を今のうちに予約。メーカーから直接届くので品質は保証済み。メッセージページも一緒に届けられます。忘れがちな季節のご挨拶を「未来予約」しておけば安心。",
    delivery: "お中元：7月 / お歳暮：12月",
    highlight: "毎年の手配を忘れない",
    category: "product",
  },
  {
    emoji: "🎂",
    title: "誕生日・記念日のギフト予約",
    description:
      "大切な人の誕生日や結婚記念日に、メッセージと商品を一緒に届ける。予約しておけば当日バタバタすることもなく、サプライズも完璧。",
    delivery: "誕生日・記念日当日",
    highlight: "サプライズを確実に届ける",
    category: "product",
  },
  {
    emoji: "🏥",
    title: "被災地への支援物資",
    description:
      "メーカーから直接届くので、被災地での安全チェック（異物混入・品質確認）が不要。受け取り側の負担を大幅に軽減できます。個人からの差し入れは安全確認に時間とコストがかかりますが、メーカー直送なら即座に届けられます。",
    delivery: "指定日 / 即時対応",
    highlight: "安全チェック不要・即座に届く",
    category: "product",
  },
  {
    emoji: "💝",
    title: "アイドル・推しへのプレゼント",
    description:
      "ファンからアイドルへのバレンタインチョコやギフト。個人からの贈り物は安全上の理由で廃棄されることがほとんどですが、メーカーから直接届く「未来予約」なら、安全が保証された状態で届くため、捨てられることなく届きます。",
    delivery: "バレンタイン・誕生日など",
    highlight: "メーカー直送だから捨てられない",
    category: "product",
  },
  {
    emoji: "🎄",
    title: "クリスマス・イベントギフト",
    description:
      "クリスマスプレゼントを事前に予約。当日の在庫切れや配送遅延の心配なし。メッセージページと一緒に届ければ、サンタさんからの手紙付きプレゼントに。",
    delivery: "12月25日",
    highlight: "在庫切れ・配送遅延なし",
    category: "product",
  },
  {
    emoji: "🎒",
    title: "入学・卒業・就職祝い",
    description:
      "人生の節目に贈るギフトとメッセージ。数ヶ月前から予約しておけば、忙しい時期でも確実に届きます。おじいちゃん・おばあちゃんからの遠方ギフトにも最適。",
    delivery: "入学式・卒業式・入社日",
    highlight: "節目を逃さない",
    category: "product",
  },
  {
    emoji: "⚾",
    title: "プロ野球選手・アスリートへの贈り物",
    description:
      "球団コラボや公式パートナーシップにより、ファンからプロ野球選手やアスリートへメーカー直送のギフトを届けられます。球団公式グッズとメッセージを組み合わせた特別な贈り物も。選手の誕生日や優勝記念に。",
    delivery: "誕生日・優勝記念・シーズン開幕",
    highlight: "球団コラボで公式に届く",
    category: "product",
  },
];

const safetyComparison = [
  {
    label: "個人からの贈り物",
    items: [
      { text: "異物混入の可能性", icon: "⚠️" },
      { text: "品質・衛生面の不安", icon: "⚠️" },
      { text: "安全チェックに時間・コスト", icon: "⚠️" },
      { text: "被災地では受け取り困難", icon: "❌" },
      { text: "アイドルへのギフトは廃棄", icon: "❌" },
    ],
    bg: "bg-red-50",
    border: "border-red-200",
    headerBg: "bg-red-100",
    headerText: "text-red-800",
  },
  {
    label: "未来予約（メーカー直送）",
    items: [
      { text: "メーカー品質保証済み", icon: "✅" },
      { text: "工場出荷の衛生管理", icon: "✅" },
      { text: "安全チェック不要", icon: "✅" },
      { text: "被災地にも即座に届く", icon: "✅" },
      { text: "安全だから捨てずに届く", icon: "✅" },
    ],
    bg: "bg-green-50",
    border: "border-green-200",
    headerBg: "bg-green-100",
    headerText: "text-green-800",
  },
];

export default function FlowPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">
            <span className="text-amber-500">&#9201;</span> 未来予約
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              トップ
            </Link>
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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white pt-32 pb-16">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 50%, rgba(251,191,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(251,191,36,0.2) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">
            SERVICE FLOW &amp; NEEDS
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            未来予約の<span className="text-amber-400">サービスフロー</span>と
            <br />
            <span className="text-amber-400">活用シーン</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
            メッセージだけでなく、メーカー直送の商品も未来の指定日に届ける。
            <br />
            安全・確実・サプライズを実現する新しい届け方。
          </p>
        </div>
      </section>

      {/* Service Flow */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
            SERVICE FLOW
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            未来予約のサービスフロー
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            メッセージも商品も、4ステップで未来に届く
          </p>
          <div className="space-y-6">
            {serviceFlows.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl shadow-lg">
                    {step.icon}
                  </div>
                  {i < serviceFlows.length - 1 && (
                    <div className="w-0.5 h-8 bg-amber-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      STEP {step.number}
                    </span>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Flow Diagram */}
          <div className="mt-12 bg-amber-50 rounded-2xl border border-amber-200 p-8">
            <h3 className="font-bold text-gray-900 text-center mb-6">
              2つの届け方
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
                <div className="text-3xl mb-2">📄</div>
                <h4 className="font-bold text-gray-900 mb-2">
                  メッセージ型
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  文章・写真・動画をまとめたメッセージページをリンク＆QRコードで届ける
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-700">
                  <span className="bg-amber-100 px-2 py-0.5 rounded-full">
                    1日10円
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
                <div className="text-3xl mb-2">🎁</div>
                <h4 className="font-bold text-gray-900 mb-2">
                  商品連動型
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  メッセージページに加え、メーカーから直接商品も届ける。安全チェック不要。
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-700">
                  <span className="bg-amber-100 px-2 py-0.5 rounded-full">
                    1日10円 + 商品代金
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message Needs */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
            MESSAGE NEEDS
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            メッセージを届けるニーズ
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            今の想いを、最高のタイミングで届ける
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {messageNeeds.map((need) => (
              <div
                key={need.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{need.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{need.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {need.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">&#9201;</span>
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {need.delivery}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product-Linked Needs */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
            PRODUCT-LINKED NEEDS
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            商品連動型の活用シーン
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            メーカー直送だから実現できる、安全で確実な届け方
          </p>

          <div className="space-y-6">
            {productNeeds.map((need) => (
              <div
                key={need.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0 text-5xl sm:self-center">
                    {need.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {need.title}
                      </h3>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        {need.highlight}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {need.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">&#9201;</span>
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {need.delivery}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Comparison - Key Differentiator */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
            WHY MANUFACTURER DIRECT
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4">
            なぜ<span className="text-amber-400">メーカー直送</span>
            なのか？
          </h2>
          <p className="text-gray-400 text-center text-sm mb-12">
            個人からの贈り物との決定的な違い
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {safetyComparison.map((col) => (
              <div
                key={col.label}
                className={`${col.bg} ${col.border} border rounded-2xl overflow-hidden`}
              >
                <div className={`${col.headerBg} px-6 py-3`}>
                  <h3 className={`font-bold text-center ${col.headerText}`}>
                    {col.label}
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {col.items.map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm text-gray-800">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Specific Examples */}
          <div className="mt-12 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">🏥</div>
                <div>
                  <h4 className="font-bold text-amber-400 mb-2">
                    被災地支援の場合
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    個人からの支援物資は、安全確認（異物混入チェック、品質確認、賞味期限確認）に多大な時間とコストがかかり、必要なタイミングで届けられないケースが多発しています。
                    <span className="text-amber-300 font-medium">
                      未来予約のメーカー直送なら、工場出荷の品質保証付きで安全チェック不要。
                    </span>
                    被災地の限られたリソースを安全確認に割く必要がなくなります。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">💝</div>
                <div>
                  <h4 className="font-bold text-amber-400 mb-2">
                    アイドル・推しへのギフトの場合
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    ファンからアイドルへ贈られるバレンタインチョコやギフトは、安全上の理由から
                    <span className="text-red-400 font-medium">
                      ほぼすべて廃棄
                    </span>
                    されているのが現実です。せっかくの気持ちが届かない。
                    <span className="text-amber-300 font-medium">
                      未来予約なら、メーカーから直接届くので安全性が保証され、捨てられることなく届きます。
                    </span>
                    ファンの想いが確実に届く新しい仕組みです。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Partners */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
            COLLABORATION
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            コラボレーション・パートナーシップ
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            球団・事務所・団体との公式連携で、新しいファン体験を創出
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">⚾</div>
              <h3 className="font-bold text-gray-900 mb-2">プロ野球球団</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                球団公式グッズ＋ファンメッセージを選手の誕生日や優勝記念に届ける。球団公認だから選手に確実に届く。
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="font-bold text-gray-900 mb-2">芸能事務所</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                メーカー直送のギフトをアイドルや俳優に届ける。安全保証により廃棄ゼロ。事務所公認の新しいファンサービス。
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="font-bold text-gray-900 mb-2">自治体・支援団体</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                被災地支援の公式チャネルとして活用。メーカー直送で安全確認の負担ゼロ。支援者への返信機能で繋がりを。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal / Event Calendar */}
      <section className="py-20 bg-amber-50">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
            EVENT CALENDAR
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            年間イベントと未来予約
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            季節のイベントを未来予約しておけば、忘れることなく届けられます
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { month: "1月", event: "お年賀", icon: "🎍" },
              { month: "2月", event: "バレンタイン", icon: "💝" },
              { month: "3月", event: "卒業祝い・ホワイトデー", icon: "🎓" },
              { month: "4月", event: "入学・就職祝い", icon: "🌸" },
              { month: "5月", event: "母の日", icon: "💐" },
              { month: "6月", event: "父の日", icon: "👔" },
              { month: "7月", event: "お中元", icon: "🎐" },
              { month: "8月", event: "お盆の贈り物", icon: "🏮" },
              { month: "9月", event: "敬老の日", icon: "👴" },
              { month: "10月", event: "ハロウィン", icon: "🎃" },
              { month: "11月", event: "七五三祝い", icon: "👘" },
              { month: "12月", event: "お歳暮・クリスマス", icon: "🎄" },
            ].map((ev) => (
              <div
                key={ev.month}
                className="bg-white rounded-xl border border-amber-200 p-4 text-center shadow-sm hover:shadow-md transition"
              >
                <div className="text-2xl mb-1">{ev.icon}</div>
                <p className="text-xs font-bold text-amber-600 mb-0.5">
                  {ev.month}
                </p>
                <p className="text-sm font-medium text-gray-900">{ev.event}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              毎年のイベントも、一度予約すれば忘れる心配なし。
              <br />
              <span className="font-bold text-amber-700">
                メッセージ＋メーカー直送ギフト
              </span>
              で、想いと贈り物を一緒に届けます。
            </p>
          </div>
        </div>
      </section>

      {/* Reply Service - Bidirectional */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
            REPLY SERVICE
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4">
            返信サービスで<span className="text-amber-600">双方向</span>に
          </h2>
          <p className="text-gray-500 text-center text-sm mb-12">
            届いたメッセージに返事ができる。想いが行き交う新しい体験。
          </p>

          {/* Bidirectional Flow Diagram */}
          <div className="max-w-lg mx-auto mb-10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-3xl border-2 border-amber-300">
                  👴
                </div>
                <p className="text-xs font-bold text-gray-900 mt-2">送り主</p>
              </div>
              <div className="flex-1 mx-4">
                <div className="relative">
                  <div className="h-0.5 bg-amber-400 w-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    メッセージ送信
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-amber-400 border-b-[5px] border-b-transparent" />
                </div>
                <div className="h-4" />
                <div className="relative">
                  <div className="h-0.5 bg-green-400 w-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    返信メッセージ
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[8px] border-r-green-400 border-b-[5px] border-b-transparent" />
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-3xl border-2 border-green-300">
                  👦
                </div>
                <p className="text-xs font-bold text-gray-900 mt-2">受け取り主</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <div className="text-3xl mb-3">📨</div>
              <h3 className="font-bold text-gray-900 mb-2">メッセージを受け取る</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                指定日にリンク＆QRコードがメールで届く。開くと、送り主が作ったメッセージページが表示されます。
              </p>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-bold text-gray-900 mb-2">返信ページを作成</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                受け取ったメッセージに対して、テキスト・写真・動画で返信ページを作成。送り主（またはそのご家族）に届けることができます。
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-center">返信サービスの活用例</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">👴</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">おじいちゃんからの20歳のお祝い</p>
                  <p className="text-xs text-gray-600">→ 孫が「ありがとう、おじいちゃん」と返信ページを作成 → おばあちゃんや家族に届く</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚾</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">ファンからプロ野球選手へのギフト</p>
                  <p className="text-xs text-gray-600">→ 選手がお礼のメッセージを返信 → ファンに届く（球団コラボで実現）</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💝</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">アイドルへのバレンタインチョコ</p>
                  <p className="text-xs text-gray-600">→ アイドルが「ありがとう」の返信メッセージを作成 → ファンに届く</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🏥</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">被災地への支援物資</p>
                  <p className="text-xs text-gray-600">→ 被災地からお礼のメッセージを返信 → 支援者に感謝の気持ちが届く</p>
                </div>
              </div>
            </div>
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
            メッセージも、商品も。メーカー直送で安全・確実に届けます。
            <br />
            1日10円のデータ保管料で、未来の感動を予約しましょう。
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
          <p>
            &copy; {new Date().getFullYear()} 未来予約. All rights reserved.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-6">
            <Link
              href="/legal"
              className="transition hover:text-gray-700"
            >
              特定商取引法に基づく表記
            </Link>
            <Link
              href="/privacy"
              className="transition hover:text-gray-700"
            >
              プライバシーポリシー
            </Link>
            <Link href="/" className="transition hover:text-gray-700">
              トップ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
