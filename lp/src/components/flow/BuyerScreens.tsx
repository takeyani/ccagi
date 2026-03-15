"use client";

import {
  ScreenMockup,
  MockSidebar,
  MockTable,
  MockBadge,
  MockButton,
  MockStatCard,
  MockFormField,
} from "./ScreenMockup";

const sidebarItems = ["ダッシュボード", "購入エージェント", "問い合わせ", "注文履歴", "自動入札", "設定"];

export function BuyerDashboardScreen() {
  return (
    <ScreenMockup title="buyer.ccagi.app/dashboard">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="ダッシュボード" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">バイヤーダッシュボード</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <MockStatCard label="稼働エージェント" value="3" />
            <MockStatCard label="検索結果" value="47件" />
            <MockStatCard label="進行中の商談" value="5" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <div className="text-[10px] font-bold mb-1.5">最新のエージェント結果</div>
            <MockTable
              headers={["エージェント", "実行日", "結果数", "最高スコア"]}
              rows={[
                ["有機食品エージェント", "3/15", "18件", "92.4"],
                ["原材料調達Bot", "3/14", "12件", "87.1"],
                ["スキンケア素材", "3/13", "17件", "78.5"],
              ]}
            />
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function AgentCreateScreen() {
  return (
    <ScreenMockup title="buyer.ccagi.app/agents/new">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="購入エージェント" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">新規購入エージェント作成</div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <MockFormField label="エージェント名" placeholder="有機食品エージェント" />

            {/* ハードフィルタ */}
            <div className="text-[9px] font-bold text-indigo-600 mb-1 mt-2">ハードフィルタ（必須条件）</div>
            <MockFormField label="キーワード" placeholder="有機 オーガニック 抹茶" />
            <div className="grid grid-cols-2 gap-2">
              <MockFormField label="最低価格" placeholder="¥1,000" />
              <MockFormField label="最高価格" placeholder="¥5,000" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MockFormField label="カテゴリ①" placeholder="食品" type="select" />
              <MockFormField label="カテゴリ②" placeholder="茶・飲料" type="select" />
            </div>
            <MockFormField label="パートナー種別" placeholder="メーカーのみ" type="select" />
            <MockFormField label="原産国" placeholder="日本" type="select" />

            {/* 認証条件 */}
            <div className="text-[9px] font-bold text-emerald-600 mb-1 mt-2">認証・プルーフ条件</div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 space-y-1">
              <div className="flex items-center gap-3 text-[9px] text-gray-600">
                <label className="flex items-center gap-1">
                  <span className="w-3 h-3 border border-emerald-500 bg-emerald-500 rounded-sm inline-block" />
                  認証済みパートナーのみ
                </label>
                <label className="flex items-center gap-1">
                  <span className="w-3 h-3 border border-emerald-500 bg-emerald-500 rounded-sm inline-block" />
                  認証有効期限内のみ
                </label>
              </div>
              <div className="text-[9px] font-medium text-emerald-700 mt-1">プルーフ必須レイヤー:</div>
              <div className="flex items-center gap-2 text-[9px] text-gray-600">
                {["L1 事業者証明", "L2 商品証明", "L3 在庫証明"].map((l, i) => (
                  <label key={i} className="flex items-center gap-1">
                    <span className={`w-3 h-3 border rounded-sm inline-block ${i < 2 ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`} />
                    {l}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[9px] text-gray-600">
                {["L4 所有権履歴", "L5 配送証明"].map((l, i) => (
                  <label key={i} className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-gray-300 rounded-sm inline-block" />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* 成分・スペック詳細条件 */}
            <div className="text-[9px] font-bold text-purple-600 mb-1 mt-2">成分・スペック詳細条件</div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-2 space-y-1.5">
              <div className="text-[9px] font-medium text-purple-700">成分条件:</div>
              <div className="space-y-1">
                {[
                  { attr: "カテキン含有量", op: "≥", val: "80%", mode: "必須" },
                  { attr: "カフェイン含有量", op: "≤", val: "3%", mode: "優先" },
                  { attr: "残留農薬", op: "=", val: "不検出", mode: "必須" },
                ].map((c, i) => (
                  <div key={i} className="bg-white border border-purple-100 rounded px-2 py-1 text-[9px] flex items-center gap-1.5">
                    <span className="font-medium text-purple-700">{c.attr}</span>
                    <span className="text-gray-400">{c.op}</span>
                    <span className="text-purple-600">{c.val}</span>
                    <MockBadge label={c.mode} color={c.mode === "必須" ? "red" : "purple"} />
                    <span className="ml-auto text-purple-300">×</span>
                  </div>
                ))}
              </div>
              <div className="text-[9px] font-medium text-purple-700 mt-1">スペック条件:</div>
              <div className="space-y-1">
                {[
                  { attr: "原産地", val: "京都府", mode: "優先" },
                  { attr: "製造方法", val: "石臼挽き", mode: "優先" },
                  { attr: "JAN CODE", val: "あり", mode: "必須" },
                ].map((c, i) => (
                  <div key={i} className="bg-white border border-purple-100 rounded px-2 py-1 text-[9px] flex items-center gap-1.5">
                    <span className="font-medium text-purple-700">{c.attr}</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-purple-600">{c.val}</span>
                    <MockBadge label={c.mode} color={c.mode === "必須" ? "red" : "purple"} />
                    <span className="ml-auto text-purple-300">×</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                <MockButton label="+ 成分条件を追加" />
                <MockButton label="+ スペック条件を追加" />
              </div>
            </div>

            {/* スコアリング重み */}
            <div className="text-[9px] font-bold text-orange-600 mb-1 mt-2">スコアリング重み調整</div>
            <div className="grid grid-cols-5 gap-1 text-[8px] text-center">
              {[
                { label: "認証", val: 80 },
                { label: "プルーフ", val: 60 },
                { label: "タグ", val: 50 },
                { label: "スペック", val: 40 },
                { label: "価格", val: 30 },
              ].map((w) => (
                <div key={w.label} className="bg-gray-50 border border-gray-200 rounded p-1">
                  <div className="text-gray-500">{w.label}</div>
                  <div className="font-bold text-gray-700">{w.val}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-1.5 mt-2">
              <MockButton label="保存" />
              <MockButton label="実行する" primary />
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function AgentResultScreen() {
  return (
    <ScreenMockup title="buyer.ccagi.app/agents/1/results">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="購入エージェント" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-sm text-gray-900">有機食品エージェント — 結果</div>
            <MockBadge label="18件ヒット" color="blue" />
          </div>
          <div className="space-y-1.5">
            {/* 1位: 展開済み（詳細表示） */}
            <div className="bg-white border border-indigo-200 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">1</div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-gray-900">京都有機抹茶 100g</div>
                  <div className="text-[9px] text-gray-400">宇治園製茶</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-600">92.4</div>
                  <div className="text-[8px] text-gray-400">総合スコア</div>
                </div>
              </div>
              {/* スコアバー */}
              <div className="grid grid-cols-5 gap-1 text-[8px] mb-2">
                {[
                  { label: "認証", val: 100, color: "#2563eb" },
                  { label: "プルーフ", val: 95, color: "#7c3aed" },
                  { label: "タグ", val: 90, color: "#059669" },
                  { label: "スペック", val: 85, color: "#d97706" },
                  { label: "価格", val: 88, color: "#dc2626" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-gray-400 mb-0.5">{s.label}: {s.val}</div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.val}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* 認証詳細 */}
              <div className="bg-emerald-50 border border-emerald-100 rounded p-1.5 mb-1.5">
                <div className="text-[8px] font-bold text-emerald-700 mb-1">認証詳細</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[8px]">
                  <div><span className="text-gray-400">認証ステータス:</span> <MockBadge label="認証済み" color="green" /></div>
                  <div><span className="text-gray-400">認証有効期限:</span> <span className="text-gray-700">2027/03/31</span></div>
                  <div><span className="text-gray-400">L1 事業者証明:</span> <MockBadge label="確認済み" color="green" /></div>
                  <div><span className="text-gray-400">L2 商品証明:</span> <MockBadge label="確認済み" color="green" /></div>
                  <div><span className="text-gray-400">L3 在庫証明:</span> <MockBadge label="確認済み" color="green" /></div>
                  <div><span className="text-gray-400">L4 所有権履歴:</span> <MockBadge label="3件記録" color="blue" /></div>
                </div>
              </div>
              {/* 成分・スペック詳細 */}
              <div className="bg-purple-50 border border-purple-100 rounded p-1.5 mb-1.5">
                <div className="text-[8px] font-bold text-purple-700 mb-1">成分・スペック詳細</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[8px]">
                  <div><span className="text-gray-400">カテキン含有量:</span> <span className="text-purple-700 font-medium">85% ✓</span></div>
                  <div><span className="text-gray-400">カフェイン含有量:</span> <span className="text-purple-700 font-medium">2.1% ✓</span></div>
                  <div><span className="text-gray-400">残留農薬:</span> <span className="text-purple-700 font-medium">不検出 ✓</span></div>
                  <div><span className="text-gray-400">原産地:</span> <span className="text-purple-700 font-medium">京都府宇治市 ✓</span></div>
                  <div><span className="text-gray-400">製造方法:</span> <span className="text-purple-700 font-medium">石臼挽き ✓</span></div>
                  <div><span className="text-gray-400">JAN CODE:</span> <span className="text-purple-700 font-medium">4901234567890 ✓</span></div>
                </div>
                <div className="mt-1 text-[8px] text-gray-400">素材: 有機抹茶100%（京都府宇治市産）</div>
              </div>
              {/* 商品スペック */}
              <div className="bg-gray-50 border border-gray-100 rounded p-1.5 mb-1.5">
                <div className="text-[8px] font-bold text-gray-600 mb-1">商品スペック</div>
                <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 text-[8px]">
                  <div><span className="text-gray-400">品番:</span> <span className="text-gray-700">MT-001</span></div>
                  <div><span className="text-gray-400">カートン入数:</span> <span className="text-gray-700">24個</span></div>
                  <div><span className="text-gray-400">N.W:</span> <span className="text-gray-700">0.10kg</span></div>
                  <div><span className="text-gray-400">サイズ:</span> <span className="text-gray-700">80×50×150mm</span></div>
                </div>
              </div>
              <div className="flex gap-1">
                <MockButton label="問い合わせ" primary />
                <MockButton label="成分表PDFを見る" />
              </div>
            </div>

            {/* 2位・3位: 折りたたみ */}
            {[
              { rank: 2, name: "静岡オーガニック煎茶", seller: "静岡茶舗", score: 87.1, cert: 100, proof: 80, tag: 85, spec: 78, price: 92 },
              { rank: 3, name: "鹿児島有機ほうじ茶", seller: "薩摩園", score: 78.5, cert: 100, proof: 70, tag: 80, spec: 60, price: 85 },
            ].map((r) => (
              <div key={r.rank} className="bg-white border border-gray-200 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                    {r.rank}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-900">{r.name}</div>
                    <div className="text-[9px] text-gray-400">{r.seller} <MockBadge label="認証済み" color="green" /></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">{r.score}</div>
                    <div className="text-[8px] text-gray-400">総合スコア</div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1 text-[8px]">
                  {[
                    { label: "認証", val: r.cert, color: "#2563eb" },
                    { label: "プルーフ", val: r.proof, color: "#7c3aed" },
                    { label: "タグ", val: r.tag, color: "#059669" },
                    { label: "スペック", val: r.spec, color: "#d97706" },
                    { label: "価格", val: r.price, color: "#dc2626" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-gray-400 mb-0.5">{s.label}: {s.val}</div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.val}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-1">
                  <span className="text-[8px] text-indigo-500 cursor-pointer">▶ 認証・成分詳細を表示</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function InquiryCreateScreen() {
  return (
    <ScreenMockup title="buyer.ccagi.app/inquiries/new">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="問い合わせ" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">問い合わせ作成</div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="bg-indigo-50 rounded-lg p-2 mb-2 text-[10px]">
              <div className="font-bold text-indigo-700">京都有機抹茶 100g</div>
              <div className="text-indigo-500">宇治園製茶 ・ スコア: 92.4 ・ ¥3,500/個</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MockFormField label="希望価格" placeholder="¥3,200" />
              <MockFormField label="希望数量" placeholder="100個" />
            </div>
            <MockFormField label="メッセージ" placeholder="サンプルの送付をお願いできますか？継続取引を検討しています。" type="textarea" />
            <div className="flex justify-end">
              <MockButton label="問い合わせを送信" primary />
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function CheckoutScreen() {
  return (
    <ScreenMockup title="ccagi.app/products/matcha/LOT-001">
      <div className="p-3 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center text-[10px] text-gray-400">
            商品画像
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 mb-1">京都有機抹茶 100g</div>
            <div className="text-[10px] text-gray-500 mb-2">宇治園製茶 <MockBadge label="認証済み" color="green" /></div>
            <div className="text-[10px] text-gray-600 mb-1">ロット: LOT-2026-001 ・ 在庫: 500個</div>
            <div className="text-lg font-bold text-gray-900 mb-2">¥3,500 <span className="text-[10px] text-gray-400 font-normal">(税込¥3,780)</span></div>
            <div className="grid grid-cols-2 gap-1.5">
              <MockButton label="カートに入れる" primary />
              <MockButton label="入札する" />
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function OrderHistoryScreen() {
  return (
    <ScreenMockup title="buyer.ccagi.app/orders">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="注文履歴" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">注文履歴</div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <MockTable
              headers={["注文番号", "商品", "販売者", "金額", "配送状況"]}
              rows={[
                ["ORD-0312", "京都有機抹茶 x100", "宇治園製茶", "¥378,000", ""],
                ["ORD-0298", "静岡煎茶 x50", "静岡茶舗", "¥165,000", ""],
                ["ORD-0275", "鹿児島ほうじ茶 x30", "薩摩園", "¥72,000", ""],
              ]}
            />
            <div className="flex gap-12 ml-2 -mt-1 mb-1">
              <span /><span /><span /><span /><span className="flex gap-1">
                <MockBadge label="配送中" color="blue" />
                <MockBadge label="到着済み" color="green" />
                <MockBadge label="到着済み" color="green" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}
