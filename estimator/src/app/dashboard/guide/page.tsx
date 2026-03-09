import {
  SCALE_OPTIONS,
  COMPLEXITY_OPTIONS,
  DEADLINE_OPTIONS,
  PLATFORM_OPTIONS,
  ADDITIONAL_FEATURES,
} from "@/lib/estimation/constants";
import { PHASE_TEMPLATES } from "@/lib/estimation/templates";

export default function GuidePage() {
  // Group templates by phase
  const phases: Record<string, { phaseName: string; tasks: { taskName: string; baseManMonths: number }[] }> = {};
  for (const t of PHASE_TEMPLATES) {
    if (!phases[t.phaseKey]) {
      phases[t.phaseKey] = { phaseName: t.phaseName, tasks: [] };
    }
    phases[t.phaseKey].tasks.push({ taskName: t.taskName, baseManMonths: t.baseManMonths });
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">見積もりガイド</h1>
      <p className="text-gray-500 text-sm mb-8">
        本ツールの見積もり算出ロジックと根拠について解説します。
      </p>

      {/* Overview */}
      <Section title="概要">
        <p>
          本ツールは、ソフトウェア開発プロジェクトの工数を
          <strong>6つの工程 × 21タスク</strong>のテンプレートをベースに、
          プロジェクトの条件（規模・複雑度・納期・プラットフォーム）に応じた
          乗数を掛けることで自動算出します。
        </p>
        <p className="mt-2">
          この手法は、ソフトウェア工学で広く用いられる
          <strong>ファンクションポイント法</strong>や
          <strong>COCOMO（Constructive Cost Model）</strong>
          の考え方を簡易的に取り入れたもので、
          過去の開発プロジェクトの実績データをもとに
          各乗数を設定しています。
        </p>
      </Section>

      {/* Formula */}
      <Section title="計算式">
        <div className="bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-sm space-y-2">
          <p>調整工数 = ベース工数 × 規模 × 複雑度 × 納期 × PF</p>
          <p>タスク金額 = 調整工数 × 単価（デフォルト 700,000円/人月）</p>
          <p>小計 = 全タスク金額の合計</p>
          <p>割引額 = 小計 × 割引率（デフォルト 30%）</p>
          <p className="text-white font-bold">合計 = 小計 − 割引額</p>
        </div>
      </Section>

      {/* Base template */}
      <Section title="ベース工数テンプレート">
        <p className="mb-4">
          「Webアプリ・中規模・標準複雑度」を基準とした工程別のベース工数です。
          IPAの「ソフトウェア開発データ白書」や、
          一般的なSI業界の工数配分比率を参考に設定しています。
        </p>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">工程</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">タスク</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ベース工数（人月）</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(phases).map((phase) =>
                phase.tasks.map((task, idx) => (
                  <tr
                    key={`${phase.phaseName}-${task.taskName}`}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-2 font-medium">
                      {idx === 0 ? phase.phaseName : ""}
                    </td>
                    <td className="px-4 py-2">{task.taskName}</td>
                    <td className="px-4 py-2 text-right">{task.baseManMonths.toFixed(1)}</td>
                  </tr>
                ))
              )}
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3" colSpan={2}>合計</td>
                <td className="px-4 py-3 text-right">
                  {PHASE_TEMPLATES.reduce((s, t) => s + t.baseManMonths, 0).toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Rationale>
          上流工程（要件定義・設計）に全体の約35%、
          実装に約35%、テスト・運用に約30%の配分は、
          ウォーターフォール型開発の一般的な工数比率に基づいています。
        </Rationale>
      </Section>

      {/* Multipliers */}
      <Section title="条件乗数">
        <p className="mb-4">
          4つの条件を掛け合わせてベース工数を調整します。
          各乗数は過去のプロジェクト実績と業界標準に基づいて設定しています。
        </p>

        <MultiplierTable
          title="規模"
          description="開発対象の画面数・機能数・データ量に応じた規模感です。"
          rationale="COCOMOモデルのサイズ係数を参考に、小規模（数画面）を0.5、エンタープライズ（100画面超）を3.0としています。中規模を1.0として線形ではなく指数的に増加する点は、大規模になるほど統合・調整コストが増大するためです。"
          items={SCALE_OPTIONS.map((o) => ({ label: o.label, value: o.multiplier }))}
        />

        <MultiplierTable
          title="複雑度"
          description="ビジネスロジックの複雑さ、技術的難易度を反映します。"
          rationale="シンプルなCRUDアプリ（0.7）と、複雑なワークフロー・計算ロジックを含むシステム（1.5）では、設計・実装・テストすべてに影響します。IPA調査では複雑度による工数差は1.5〜2.0倍とされています。"
          items={COMPLEXITY_OPTIONS.map((o) => ({ label: o.label, value: o.multiplier }))}
        />

        <MultiplierTable
          title="納期"
          description="開発期間の余裕度です。急ぎの場合、並行作業や残業による効率低下を見込みます。"
          rationale="ブルックスの法則「遅れているプロジェクトに人員を追加するとさらに遅れる」が示す通り、短納期はコミュニケーションコスト増大を招きます。急ぎ（1.3）は30%の効率低下を想定しています。"
          items={DEADLINE_OPTIONS.map((o) => ({ label: o.label, value: o.multiplier }))}
        />

        <MultiplierTable
          title="プラットフォーム"
          description="対象プラットフォームの数と種類です。"
          rationale="モバイル対応（1.2）はレスポンシブ対応やネイティブ固有の考慮事項、Web＋モバイル両対応（1.8）はコードベースの二重管理・テスト工数増を反映しています。単純な2倍ではなく1.8としているのは、共通ロジックの再利用を見込んでいるためです。"
          items={PLATFORM_OPTIONS.map((o) => ({ label: o.label, value: o.multiplier }))}
        />
      </Section>

      {/* Calculation example */}
      <Section title="計算例">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h4 className="font-bold mb-3">
            例: 大規模 × 複雑 × 急ぎ × Web+モバイル両方
          </h4>
          <div className="font-mono text-sm space-y-1 mb-4">
            <p>乗数 = 1.8 × 1.5 × 1.3 × 1.8 = <strong>6.318</strong></p>
            <p>ベース合計 = 14.3人月</p>
            <p>調整後合計 = 14.3 × 6.318 = <strong>約90.35人月</strong></p>
            <p>小計 = 90.35 × 700,000 = <strong>¥63,245,000</strong></p>
            <p>割引（30%） = -¥18,973,500</p>
            <p className="text-lg font-bold">合計 = ¥44,271,500</p>
          </div>
          <Rationale>
            エンタープライズ級の大規模かつ複雑なシステムを短納期で
            マルチプラットフォーム開発する場合、
            中規模標準案件の約6.3倍の工数が必要になるという見積もりです。
          </Rationale>
        </div>
      </Section>

      {/* Additional features */}
      <Section title="追加機能による加算">
        <p className="mb-4">
          選択した追加機能ごとに、該当フェーズの工数に人月が加算されます。
          加算値は各機能の実装難易度と品質保証に必要な工数に基づいています。
        </p>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">機能</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">設計加算</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">実装加算</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">テスト加算</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">合計加算</th>
              </tr>
            </thead>
            <tbody>
              {ADDITIONAL_FEATURES.map((f) => (
                <tr key={f.key} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{f.label}</td>
                  <td className="px-4 py-2 text-right">
                    {f.design > 0 ? `+${f.design.toFixed(1)}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {f.implementation > 0 ? `+${f.implementation.toFixed(1)}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {f.test > 0 ? `+${f.test.toFixed(1)}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    +{(f.design + f.implementation + f.test).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Rationale>
          例えば「決済機能」は、セキュリティ要件（PCI DSS準拠）、
          外部API連携（Stripe等）、異常系テスト（二重課金防止等）の
          工数が大きいため、合計+1.8人月と最も大きな加算値になっています。
        </Rationale>
      </Section>

      {/* Unit price */}
      <Section title="単価の根拠">
        <p>
          デフォルト単価の<strong>70万円/人月</strong>は、
          経済産業省「IT人材の最新動向と将来推計に関する調査」や、
          一般的なSIer・Web制作会社の見積もり相場を参考に設定しています。
        </p>
        <div className="mt-4 bg-white rounded-2xl border shadow-sm p-6">
          <h4 className="font-bold mb-3">業界相場の参考レンジ</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span>大手SIer</span>
              <span className="font-medium">100〜200万円/人月</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>中堅SIer・Web制作会社</span>
              <span className="font-medium text-indigo-600">60〜100万円/人月</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>フリーランス</span>
              <span className="font-medium">40〜80万円/人月</span>
            </div>
            <div className="flex justify-between">
              <span>オフショア</span>
              <span className="font-medium">20〜50万円/人月</span>
            </div>
          </div>
        </div>
        <Rationale>
          70万円/人月は中堅企業の標準レンジの中央値に位置し、
          品質と価格のバランスが取れた設定です。
          設定画面からプロジェクトや顧客に応じて変更可能です。
        </Rationale>
      </Section>

      {/* Discount */}
      <Section title="割引率の根拠">
        <p>
          デフォルトの<strong>30%割引</strong>は、
          以下の目的で設定されています。
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
          <li>
            <strong>競争力のある価格提示</strong> —
            初回取引や新規顧客獲得のために、
            定価から一定の値引きを行うことで受注率を向上させます。
          </li>
          <li>
            <strong>バッファの確保</strong> —
            定価（小計）にはリスクバッファが含まれており、
            割引後の価格が実質的な適正価格となります。
          </li>
          <li>
            <strong>心理的アンカリング効果</strong> —
            定価を提示した上で割引を適用することで、
            顧客に「お得感」を伝え、価格交渉の基準点を設定します。
          </li>
        </ul>
        <Rationale>
          割引率は設定画面から0〜100%の範囲で自由に変更できます。
          案件や顧客との関係性に応じて調整してください。
        </Rationale>
      </Section>

      {/* References */}
      <Section title="参考文献・出典">
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">[1]</span>
            <span>IPA（独立行政法人情報処理推進機構）「ソフトウェア開発データ白書」— 工程別工数比率の業界標準データ</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">[2]</span>
            <span>Barry W. Boehm「Software Engineering Economics」— COCOMOモデルによる工数見積もり手法</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">[3]</span>
            <span>Frederick P. Brooks Jr.「人月の神話」— ソフトウェア開発の工数と人員の非線形関係</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">[4]</span>
            <span>経済産業省「IT人材の最新動向と将来推計に関する調査」— IT人材単価の市場データ</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">[5]</span>
            <span>JUAS（日本情報システム・ユーザー協会）「企業IT動向調査」— 企業のIT投資と開発費用の実態</span>
          </li>
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-3 pb-2 border-b">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Rationale({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
      <span className="font-bold">根拠: </span>
      {children}
    </div>
  );
}

function MultiplierTable({
  title,
  description,
  rationale,
  items,
}: {
  title: string;
  description: string;
  rationale: string;
  items: { label: string; value: number }[];
}) {
  return (
    <div className="mb-6">
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-500 mb-2">{description}</p>
      <div className="flex gap-3 mb-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-white border rounded-lg px-4 py-3 text-center min-w-[100px]"
          >
            <p className="text-sm text-gray-600">{item.label}</p>
            <p className="text-xl font-bold mt-1">×{item.value}</p>
          </div>
        ))}
      </div>
      <Rationale>{rationale}</Rationale>
    </div>
  );
}
