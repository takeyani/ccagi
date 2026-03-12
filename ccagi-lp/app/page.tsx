export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">CCAGI</span>
          <a
            href="#contact"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
          >
            お問い合わせ
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-4">
            Beyond Generative AI
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            生成AIは「答える」。
            <br />
            <span className="text-indigo-600">CCAGIは「つくる」。</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            テキスト生成を超え、自律エージェントが設計・実装・テスト・デプロイまで
            一気通貫でプロダクトを構築する — それがCCAGIです。
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            生成AI vs CCAGI
          </h2>
          <p className="text-center text-gray-500 mb-12">
            従来の生成AIとCCAGIの根本的な違い
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 w-1/4">
                    比較項目
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-400 w-[37.5%]">
                    生成AI（ChatGPT等）
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-indigo-600 w-[37.5%]">
                    CCAGI
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {comparisons.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {row.label}
                    </td>
                    <td className="py-4 px-6 text-gray-500">{row.genai}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {row.ccagi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Key Differences */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            CCAGIが変えること
          </h2>
          <p className="text-center text-gray-500 mb-12">
            3つの根本的なパラダイムシフト
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {paradigms.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {p.before}
                </p>
                <div className="my-3 flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                  <span className="h-px flex-1 bg-indigo-200" />
                  <span>CCAGI</span>
                  <span className="h-px flex-1 bg-indigo-200" />
                </div>
                <p className="text-gray-900 text-sm leading-relaxed font-medium">
                  {p.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            CCAGIのアーキテクチャ
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Claude Agent SDK を核とした自律型開発基盤
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {layers.map((l, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-gray-200 p-6 text-center"
              >
                <div className="text-3xl mb-3">{l.icon}</div>
                <h4 className="font-bold mb-2">{l.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-gray-900 text-gray-100 p-8 font-mono text-sm overflow-x-auto">
            <p className="text-gray-400 mb-2"># CCAGIの実行例</p>
            <p>
              <span className="text-green-400">$</span> ccagi-sdk
              &quot;見積もりツールをNext.jsで作って&quot;
            </p>
            <p className="text-gray-500 mt-2">
              → 要件定義 → DB設計 → UI実装 → API構築 → テスト → デプロイ
            </p>
            <p className="text-gray-500">
              → 数時間で本番稼働するWebアプリが完成
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            CCAGIで構築した実例
          </h2>
          <p className="text-center text-gray-500 mb-12">
            すべてCCAGIエージェントが自律的に設計・実装
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((uc, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 p-8">
                <div className="text-3xl mb-3">{uc.icon}</div>
                <h3 className="text-lg font-bold mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{uc.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {uc.techs.map((t, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Orchestration — Agent Framework */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold text-emerald-400 tracking-widest uppercase text-center mb-4">
            Genius-Level Orchestration
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            IQ150超の天才エンジニアが設計した
            <br className="hidden sm:block" />
            AIエージェント・フレームワーク
          </h2>
          <p className="text-center text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
            ブロックチェーンを構築できるレベルのトップエンジニアが、
            システム開発の全工程を分析し、フェーズ・タスク・ラベルの構成まで設計した
            AIエージェント群。必要なフェーズで、必要なエージェントが、
            オーケストレーションとして自律的に連携します。
          </p>

          {/* Orchestration Flow */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              {orchestrationPhases.map((phase, i) => (
                <div key={i} className="flex-1 relative">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-6 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 rounded-full px-2.5 py-0.5">
                        Phase {i + 1}
                      </span>
                      <span className="text-xs text-gray-500">{phase.label}</span>
                    </div>
                    <h4 className="font-bold mb-2">{phase.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{phase.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {phase.agents.map((a, j) => (
                        <span key={j} className="text-[10px] rounded bg-white/10 px-2 py-0.5 text-gray-300">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  {i < orchestrationPhases.length - 1 && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-400/50 text-lg">
                      &rarr;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Why this matters */}
          <div className="grid sm:grid-cols-3 gap-6">
            {orchestrationPoints.map((p, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-6">
                <div className="text-2xl mb-3">{p.icon}</div>
                <h4 className="font-semibold text-sm mb-2">{p.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            一般的なAIコーディングツールは「コードを書く」だけ。
            CCAGIのエージェント群は、システム開発のプロが行う思考プロセスそのものを
            フレームワークとして実装しています。
          </p>
        </div>
      </section>

      {/* Security — Iron Dome Approach */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-950 to-gray-900 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold text-red-400 tracking-widest uppercase text-center mb-4">
            Iron Dome Security
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            アイアンドーム型セキュリティ
          </h2>
          <p className="text-center text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
            CCAGIは「コードを書いて終わり」ではありません。
            最新の脆弱性情報を常に監視し、プロダクトに自動でパッチを適用する
            <strong className="text-white">アイアンドーム型の防御アプローチ</strong>を採用しています。
          </p>

          {/* Security Flow */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 mb-12">
            <div className="grid md:grid-cols-4 gap-6">
              {securityFlow.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                  {i < securityFlow.length - 1 && (
                    <div className="hidden md:block text-red-500/30 text-xl mt-3">&darr;</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comparison: Traditional vs Iron Dome */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
              <h3 className="text-lg font-bold mb-4 text-gray-400">従来のセキュリティ対応</h3>
              <div className="space-y-3 text-sm">
                {traditionalSecurity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 mt-1 text-red-400">✕</span>
                    <span className="text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-8">
              <h3 className="text-lg font-bold mb-4 text-red-400">CCAGIアイアンドーム</h3>
              <div className="space-y-3 text-sm">
                {ironDomeSecurity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 mt-1 text-emerald-400">✓</span>
                    <span className="text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-8 text-center">
            <p className="text-lg font-bold mb-2">
              脆弱性は「見つかってから対応」では遅い
            </p>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
              CCAGIのアイアンドームは、脆弱性データベースの更新を常時監視し、
              該当するパッケージを使用しているプロジェクトに対して自動でパッチを提案・適用します。
              人間が気づく前に、プロダクトは既に守られています。
            </p>
          </div>
        </div>
      </section>

      {/* Reasoning Model — The Core Difference */}
      <section className="py-20 px-6 bg-indigo-950 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold text-indigo-300 tracking-widest uppercase text-center mb-4">
            The Most Important Difference
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            推論モデルが、根本的に違う
          </h2>
          <p className="text-center text-indigo-200 max-w-3xl mx-auto mb-6 leading-relaxed">
            推論モデルが違えば、<strong className="text-white">集める情報の質</strong>が変わる。
            <br />
            必要なものだけを正確に取り、不要なものは持ってこない。
            <br className="hidden sm:block" />
            その差が、プロダクト全体の品質を決定します。
          </p>
          <p className="text-center text-indigo-300/80 text-sm max-w-2xl mx-auto mb-16 leading-relaxed">
            軽量モデルは「関連しそうな情報」を広く浅く集め、確率的な重みづけで「それらしい」答えを出す。
            Opusは「この工程で本当に必要な情報」だけを的確に選び取り、論理的に判断する。
            その結果、エラーやハルシネーションが圧倒的に少なく、
            成果物の正確性とスピードが段違い — これがスペックの差です。
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
              <h3 className="text-lg font-bold mb-4 text-gray-300">Claude Code のモデル戦略</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-gray-400">タスクに応じてHaiku / Sonnet / Opusを自動選択</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-gray-400">簡単なタスクには軽量モデルで高速応答</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-gray-400">情報収集が広く浅い — 「関連しそう」な情報を多めに取得</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-gray-400">個別タスクの完了が目的 — 全体の整合性は人間が担保</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-indigo-500/15 border border-indigo-400/30 p-8">
              <h3 className="text-lg font-bold mb-4 text-indigo-300">CCAGI のモデル戦略</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-indigo-100">常にOpus — 最高の推論能力でプロダクトを構築</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-indigo-100">DB設計の判断ミスは全レイヤーに波及 — 妥協しない</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-indigo-100">必要な情報だけを正確に取得 — ノイズのない判断</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-indigo-100">重みづけではなく論理的判断 — エラー・ハルシネーションが圧倒的に少ない</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
            <h3 className="text-center font-bold mb-6 text-lg">なぜ推論モデルが重要なのか</h3>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              {reasoningMatters.map((r, i) => (
                <div key={i}>
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{r.title}</h4>
                  <p className="text-xs text-indigo-300 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Claude Code vs CCAGI */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Claude Code vs CCAGI
          </h2>
          <p className="text-center text-gray-500 mb-12">
            CCAGIはClaude Codeの上に構築されたプロダクト開発プラットフォームです
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                  &gt;_
                </div>
                <h3 className="text-xl font-bold">Claude Code</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Anthropic公式のCLI開発ツール。ターミナルからClaudeにコーディング作業を依頼できる汎用ツール。
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {claudeCodePoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">-</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-indigo-200 bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600">
                  C
                </div>
                <h3 className="text-xl font-bold text-indigo-600">CCAGI</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Claude Code + Agent SDK を基盤に、プロダクト構築に特化した自律開発プラットフォーム。
              </p>
              <ul className="space-y-2 text-sm text-gray-900">
                {ccagiPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">+</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-500 w-1/4">比較</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-400 w-[37.5%]">Claude Code</th>
                  <th className="py-3 px-4 text-sm font-semibold text-indigo-600 w-[37.5%]">CCAGI</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {ccComparisons.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.label}</td>
                    <td className="py-3 px-4 text-gray-500">{row.cc}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{row.ccagi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            CCAGIはClaude Codeを否定するものではなく、その能力を最大限に活用して
            <br className="hidden sm:block" />
            「ツールとしてのAI」から「チームメイトとしてのAI」への進化を実現します。
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 px-6 bg-gray-900 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            生成AIの「次」を体験しませんか？
          </h2>
          <p className="text-gray-400 mb-8">
            CCAGIは、テキスト生成ではなくプロダクト構築を自動化します。
            <br />
            あなたのアイデアを、数時間で動くプロダクトに変えましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/takeyani/ccagi"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white text-gray-900 px-8 py-3 font-semibold hover:bg-gray-100 transition"
            >
              GitHub で見る
            </a>
            <a
              href="mailto:contact@example.com"
              className="rounded-full border border-white/30 px-8 py-3 font-semibold hover:bg-white/10 transition"
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} CCAGI. Built by CCAGI agents.
      </footer>
    </div>
  );
}

const comparisons = [
  {
    label: "本質",
    genai: "テキスト生成エンジン",
    ccagi: "自律型プロダクト構築エージェント",
  },
  {
    label: "出力",
    genai: "文章・コード断片・画像",
    ccagi: "動作するアプリケーション全体",
  },
  {
    label: "操作",
    genai: "プロンプトを1回ずつ入力",
    ccagi: "ゴールを伝えたら自律的に完遂",
  },
  {
    label: "ツール利用",
    genai: "テキスト出力のみ（コピペが必要）",
    ccagi: "ファイル操作・Git・DB・API を直接実行",
  },
  {
    label: "コンテキスト",
    genai: "会話ウィンドウ内で完結",
    ccagi: "プロジェクト全体を把握して横断的に作業",
  },
  {
    label: "品質保証",
    genai: "人間がレビュー・テスト",
    ccagi: "エージェントが自動テスト・型チェック・修正",
  },
  {
    label: "マルチステップ",
    genai: "1ターン完結（人間がつなぐ）",
    ccagi: "設計→実装→テスト→デプロイを一気通貫",
  },
  {
    label: "学習",
    genai: "セッションごとにリセット",
    ccagi: "プロジェクトの記憶を永続化して蓄積",
  },
];

const paradigms = [
  {
    icon: "01",
    title: "生成 → 構築",
    before:
      "生成AIはコード「断片」を出力します。人間がそれをコピーし、ファイルに貼り付け、エラーを修正し、テストを書く必要があります。",
    after:
      "CCAGIはプロジェクト全体を設計し、ファイルを作成・編集し、依存関係をインストールし、テストを実行し、バグを自分で修正します。",
  },
  {
    icon: "02",
    title: "受動 → 自律",
    before:
      "生成AIは質問に答えるだけの受動的なツールです。毎回ユーザーが次のステップを指示する必要があります。",
    after:
      "CCAGIはゴールを理解し、タスクを分解し、優先順位をつけ、障害を検出・回避しながら自律的にプロジェクトを完遂します。",
  },
  {
    icon: "03",
    title: "テキスト → アクション",
    before:
      "生成AIの出力はテキストです。実際の環境（ファイルシステム、DB、API）には何も影響を与えません。",
    after:
      "CCAGIはファイルの読み書き、Gitコミット、DBマイグレーション、APIコール、ビルドコマンドを実際に実行します。",
  },
];

const layers = [
  {
    icon: "🧠",
    title: "Claude Opus",
    desc: "最先端のLLMが推論・設計・コード生成を担当",
  },
  {
    icon: "🔧",
    title: "Agent SDK",
    desc: "ツール実行・ファイル操作・マルチターン制御を提供",
  },
  {
    icon: "📂",
    title: "プロジェクト認識",
    desc: "コードベース全体を理解し、既存パターンに沿って開発",
  },
  {
    icon: "🔄",
    title: "自己修正ループ",
    desc: "ビルドエラー・テスト失敗を検知し自動で修正を繰り返す",
  },
];

const claudeCodePoints = [
  "汎用コーディングアシスタント（言語・フレームワーク問わず）",
  "ファイル編集・検索・Bash実行などのツールを備えたCLI",
  "1つのタスクに対して対話的に指示を出しながら作業",
  "開発者の「手」として個別タスクを高速に処理",
  "セッション単位で完結、プロジェクト横断の記憶は限定的",
];

const ccagiPoints = [
  "プロダクト構築に特化 — 要件定義からデプロイまでカバー",
  "Agent SDKによるマルチターン自律実行（人間の介入を最小化）",
  "プロジェクト構造・設計パターン・DB設計を自動で一貫管理",
  "複数プロジェクトを横断するモノレポ構築（LP・API・ビューア等）",
  "プロジェクトの記憶を永続化し、セッションを超えて知見を蓄積",
];

const securityFlow = [
  {
    icon: "📡",
    title: "脆弱性の検知",
    desc: "CVEデータベース・npm advisory・GitHub Security Advisoryを常時監視。新たな脆弱性を即座にキャッチ。",
  },
  {
    icon: "🔍",
    title: "影響範囲の特定",
    desc: "プロジェクト内の依存関係を解析し、該当パッケージとその利用箇所を自動特定。",
  },
  {
    icon: "🛠️",
    title: "パッチの自動適用",
    desc: "最新のセキュリティパッチを適用。破壊的変更がある場合はコード修正も含めて対応。",
  },
  {
    icon: "🛡️",
    title: "継続的防御",
    desc: "パッチ適用後もビルド・テストを自動実行し、修正が正しく動作することを保証。",
  },
];

const traditionalSecurity = [
  "脆弱性が公表されてから人間が気づくまでにタイムラグ",
  "npm audit の警告を見ても、どう対応すべきか判断に時間がかかる",
  "パッチ適用で既存機能が壊れるリスクがあり、慎重になりすぎる",
  "セキュリティ対応が後回しになり、技術的負債として蓄積",
  "OWASP Top 10は知っていても、実装時に見落としが発生",
];

const ironDomeSecurity = [
  "脆弱性の公表と同時に自動検知 — ゼロデイに近い速度で対応",
  "影響範囲を正確に特定し、最小限の変更で最大の防御効果",
  "パッチ適用 + 自動テストで「直したら壊れた」を防止",
  "セキュリティ対応が開発フローに組み込まれ、負債にならない",
  "コード生成時点でOWASP Top 10（XSS・SQLi・CSRF等）を自動回避",
];

const orchestrationPhases = [
  {
    label: "PLAN",
    title: "要件分析・設計",
    desc: "プロジェクト全体を俯瞰し、DBスキーマ・API設計・UI構成・認証フローを一貫した設計として策定。",
    agents: ["Architect Agent", "Schema Designer", "Plan Validator"],
  },
  {
    label: "BUILD",
    title: "実装・構築",
    desc: "設計に基づきコード生成・ファイル構成・依存関係管理を実行。各レイヤーの整合性を保ちながら並行構築。",
    agents: ["Code Generator", "File Manager", "Dependency Resolver"],
  },
  {
    label: "VERIFY",
    title: "検証・修正",
    desc: "型チェック・ビルド・テスト実行を自動で行い、エラーを検知したら原因を特定し自己修正。",
    agents: ["Type Checker", "Test Runner", "Bug Fixer"],
  },
  {
    label: "SHIP",
    title: "デプロイ・文書化",
    desc: "ビルド最適化・デプロイ設定・ONBOARDING.mdやAPI仕様書の自動生成まで完遂。",
    agents: ["Deploy Agent", "Doc Generator", "Review Agent"],
  },
];

const orchestrationPoints = [
  {
    icon: "🔗",
    title: "ブロックチェーン級の設計力",
    desc: "分散システム・暗号技術・コンセンサスアルゴリズムを構築できるレベルのエンジニアリング知見が、フレームワークの設計思想に組み込まれている。",
  },
  {
    icon: "🎼",
    title: "フェーズ別エージェント配置",
    desc: "「何でもやるAI」ではなく、各フェーズに特化したエージェントが最適なタイミングで起動。タスクとラベルの構成まで考慮された精密なオーケストレーション。",
  },
  {
    icon: "🧬",
    title: "天才のフレームワーク",
    desc: "IQ150超の開発者が数千時間のシステム開発経験を分析し、暗黙知をフレームワークとして形式化。誰でもトップエンジニアの思考プロセスを再現できる。",
  },
];

const reasoningMatters = [
  {
    icon: "🎯",
    title: "情報収集の精度",
    desc: "軽量モデルは「関連しそう」な情報を広く集め、ノイズが判断を歪める。Opusは今この工程で本当に必要な情報だけを選び取り、不要なものは読まない。",
  },
  {
    icon: "🧩",
    title: "重みづけではない判断",
    desc: "軽量モデルは確率的な重みづけで「それらしい」答えを出す。Opusは論理的に判断する。この差がエラーとハルシネーションの発生率を圧倒的に下げる。",
  },
  {
    icon: "🏗️",
    title: "設計判断の波及",
    desc: "DB設計の1つのミスがUI・API・認証・テスト全層に波及する。正確な情報収集と論理的判断ができなければ、数百ファイルの整合性は保てない。",
  },
];

const ccComparisons = [
  {
    label: "推論モデル",
    cc: "タスク難度に応じてHaiku/Sonnet/Opusを切替",
    ccagi: "常にOpus — 必要な情報だけを正確に取得し論理的に判断",
  },
  {
    label: "情報収集",
    cc: "関連しそうな情報を広く取得（ノイズを含む）",
    ccagi: "必要なものだけ取り、不要なものは持ってこない",
  },
  {
    label: "正確性",
    cc: "確率的重みづけ — ハルシネーションのリスクあり",
    ccagi: "論理的判断 — エラー・ハルシネーションが圧倒的に少ない",
  },
  {
    label: "位置づけ",
    cc: "汎用コーディングCLIツール",
    ccagi: "プロダクト構築プラットフォーム",
  },
  {
    label: "スコープ",
    cc: "1ファイル〜1機能の単位で作業",
    ccagi: "プロジェクト全体を俯瞰して設計・実装",
  },
  {
    label: "自律性",
    cc: "対話的（人間が次の指示を出す）",
    ccagi: "自律的（ゴールから逆算して自走）",
  },
  {
    label: "記憶",
    cc: "セッション内コンテキスト",
    ccagi: "永続メモリ＋ドキュメント自動生成で知見を蓄積",
  },
  {
    label: "成果物",
    cc: "コード修正・機能追加",
    ccagi: "DB設計＋API＋UI＋認証＋テスト＋ドキュメントの完成品",
  },
  {
    label: "チーム開発",
    cc: "個人の生産性向上ツール",
    ccagi: "ONBOARDING.md・設計書を自動生成し、チーム共有を前提に構築",
  },
];

const useCases = [
  {
    icon: "💰",
    title: "開発見積もりツール",
    desc: "条件入力から工程別工数を自動算出。PDF出力対応のフルスタックWebアプリ。",
    techs: ["Next.js", "Supabase", "React PDF", "Tailwind"],
  },
  {
    icon: "🏗️",
    title: "3D CADビューア",
    desc: "IFC/glTF/FBX等9形式対応。ブラウザ上で3Dモデルを閲覧・操作。",
    techs: ["Three.js", "web-ifc", "WASM", "Next.js"],
  },
  {
    icon: "🛒",
    title: "B2B マーケットプレイス",
    desc: "商品管理・オークション・証明チェーン・LP作成機能を持つ総合プラットフォーム。",
    techs: ["Next.js", "Supabase", "Stripe", "46テーブル"],
  },
];
