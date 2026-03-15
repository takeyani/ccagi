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

const sidebarItems = ["ダッシュボード", "デザイン", "コレクション", "アナリティクス", "プロフィール"];

export function CreatorDashboardScreen() {
  return (
    <ScreenMockup title="creator.ccagi.app/dashboard">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="ダッシュボード" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">クリエイターダッシュボード</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <MockStatCard label="公開LP数" value="5" />
            <MockStatCard label="今月の閲覧数" value="12,480" />
            <MockStatCard label="今月の報酬" value="¥43,200" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <div className="text-[10px] font-bold mb-1.5">LP別パフォーマンス</div>
            <MockTable
              headers={["LP名", "閲覧数", "CV数", "CV率", "報酬"]}
              rows={[
                ["2026おすすめ抹茶特集", "5,200", "48", "0.92%", "¥18,400"],
                ["プロテイン徹底比較", "4,100", "32", "0.78%", "¥14,200"],
                ["スキンケア素材ガイド", "3,180", "22", "0.69%", "¥10,600"],
              ]}
            />
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function LPEditorScreen() {
  return (
    <ScreenMockup title="creator.ccagi.app/designs/new">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="デザイン" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-sm text-gray-900">LPエディタ</div>
            <div className="flex gap-1">
              <MockButton label="プレビュー" />
              <MockButton label="公開する" primary />
            </div>
          </div>
          <div className="flex gap-2">
            {/* ブロック一覧 */}
            <div className="w-24 bg-white border border-gray-200 rounded-lg p-2 shrink-0">
              <div className="text-[8px] font-bold text-gray-500 mb-1">コンテンツ</div>
              {["🖼️ ヒーロー", "📝 商品情報", "📦 ロット", "⭐ 特徴", "💬 体験談", "❓ FAQ", "🔘 CTA"].map((b) => (
                <div key={b} className="text-[8px] bg-gray-50 border border-gray-200 rounded px-1.5 py-1 mb-1 text-gray-600 cursor-move">
                  {b}
                </div>
              ))}
              <div className="text-[8px] font-bold text-gray-500 mb-1 mt-2">メディア</div>
              {["🖼️ 画像", "🎬 動画", "📸 ギャラリー", "🎞️ スライダー", "📄 テキスト", "➖ 区切り"].map((b) => (
                <div key={b} className="text-[8px] bg-pink-50 border border-pink-200 rounded px-1.5 py-1 mb-1 text-pink-700 cursor-move">
                  {b}
                </div>
              ))}
            </div>
            {/* プレビューエリア */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* ヒーロー（背景画像付き） */}
              <div className="bg-indigo-600 text-white p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                <div className="absolute top-0.5 right-1 text-[7px] text-white/60 z-10">🖼️ 背景画像設定済み</div>
                <div className="relative z-10">
                  <div className="text-[8px] text-indigo-200 mb-0.5">HERO ブロック</div>
                  <div className="text-xs font-bold">京都の本格有機抹茶</div>
                  <div className="text-[9px] text-indigo-200">石臼挽き・カテキン豊富</div>
                </div>
              </div>
              {/* 画像ブロック */}
              <div className="p-2 border-b border-dashed border-gray-200">
                <div className="text-[8px] text-pink-400 mb-0.5 flex items-center gap-1">🖼️ IMAGE ブロック <MockBadge label="アップロード済" color="green" /></div>
                <div className="bg-gray-100 rounded h-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[9px] text-gray-400">matcha-hero.jpg</div>
                    <div className="text-[7px] text-gray-300">1200 x 800px ・ 340KB</div>
                  </div>
                </div>
              </div>
              {/* 動画ブロック */}
              <div className="p-2 border-b border-dashed border-gray-200">
                <div className="text-[8px] text-pink-400 mb-0.5 flex items-center gap-1">🎬 VIDEO ブロック <MockBadge label="YouTube" color="red" /></div>
                <div className="bg-gray-900 rounded h-10 flex items-center justify-center relative">
                  <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                    <span className="text-[8px] ml-0.5">▶</span>
                  </div>
                  <div className="absolute bottom-0.5 left-1 text-[7px] text-white/60">抹茶の製造工程 ・ 3:24</div>
                </div>
              </div>
              {/* 商品情報 */}
              <div className="p-2 border-b border-dashed border-gray-200">
                <div className="text-[8px] text-gray-400 mb-0.5">PRODUCT_INFO ブロック</div>
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-[7px] text-gray-300 shrink-0">商品画像</div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-900">有機抹茶パウダー 100g</div>
                    <div className="text-[9px] text-gray-500">¥3,500（税込¥3,780）</div>
                    <div className="text-[8px] text-gray-400">品番: MT-001 ・ JAN: 4901234567890</div>
                  </div>
                </div>
              </div>
              {/* ギャラリーブロック */}
              <div className="p-2 border-b border-dashed border-gray-200">
                <div className="text-[8px] text-pink-400 mb-0.5">📸 GALLERY ブロック（4枚）</div>
                <div className="grid grid-cols-4 gap-1">
                  {["パッケージ", "粉末アップ", "ラテ例", "畑の風景"].map((img) => (
                    <div key={img} className="bg-gray-100 rounded h-7 flex items-center justify-center text-[7px] text-gray-300">{img}</div>
                  ))}
                </div>
              </div>
              {/* 特徴 */}
              <div className="p-2 border-b border-dashed border-gray-200">
                <div className="text-[8px] text-gray-400 mb-0.5">FEATURES ブロック</div>
                <div className="grid grid-cols-3 gap-1 text-[8px] text-gray-600">
                  <div className="text-center">⭐ 有機JAS認証</div>
                  <div className="text-center">🍵 石臼挽き</div>
                  <div className="text-center">📦 即日発送</div>
                </div>
              </div>
              {/* CTA */}
              <div className="p-2 bg-indigo-50 text-center">
                <div className="text-[8px] text-gray-400 mb-0.5">CTA ブロック</div>
                <MockButton label="今すぐ購入する" primary />
              </div>
            </div>
            {/* テーマ・メディア設定 */}
            <div className="w-28 bg-white border border-gray-200 rounded-lg p-2 shrink-0">
              <div className="text-[8px] font-bold text-gray-500 mb-1">テーマ</div>
              <div className="text-[8px] text-gray-500 mb-0.5">メインカラー</div>
              <div className="flex gap-1 mb-1.5">
                {["#4f46e5", "#059669", "#dc2626", "#7c3aed", "#d97706"].map((c) => (
                  <div key={c} className="w-4 h-4 rounded-full border border-gray-200" style={{ background: c }} />
                ))}
              </div>
              <div className="text-[8px] text-gray-500 mb-0.5">フォント</div>
              <div className="text-[8px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 mb-2">
                Noto Sans JP ▾
              </div>
              {/* メディアライブラリ */}
              <div className="text-[8px] font-bold text-gray-500 mb-1 border-t border-gray-100 pt-1.5">メディア</div>
              <div className="space-y-1 mb-1.5">
                <div className="bg-gray-50 border border-gray-200 rounded p-1">
                  <div className="text-[7px] font-medium text-gray-600">画像アップロード</div>
                  <div className="text-[7px] text-gray-400">JPG, PNG, WebP, SVG</div>
                  <div className="text-[7px] text-gray-400">最大10MB/枚</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-1">
                  <div className="text-[7px] font-medium text-gray-600">動画</div>
                  <div className="text-[7px] text-gray-400">YouTube / Vimeo URL</div>
                  <div className="text-[7px] text-gray-400">MP4アップロード</div>
                </div>
              </div>
              <div className="text-[7px] text-pink-600 font-medium cursor-pointer mb-2">📁 メディアライブラリ →</div>
              <MockFormField label="スラッグ" placeholder="matcha-special" />
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function CollectionScreen() {
  return (
    <ScreenMockup title="creator.ccagi.app/collections/new">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="コレクション" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">コレクション作成</div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <MockFormField label="タイトル" placeholder="2026年おすすめオーガニック食品 TOP10" />
            <div className="text-[9px] font-bold text-gray-600 mb-1">フィルタ条件</div>
            <div className="flex flex-wrap gap-1 mb-2">
              <MockBadge label="タグ: オーガニック" color="purple" />
              <MockBadge label="タグ: 食品" color="purple" />
              <MockBadge label="認証済みのみ" color="green" />
              <MockBadge label="+ 条件追加" color="gray" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <div className="text-[9px] font-bold text-gray-600 mb-1">プレビュー（8件マッチ）</div>
            <div className="grid grid-cols-4 gap-1.5">
              {["有機抹茶", "玄米プロテイン", "柚子エキス", "黒酢サプリ"].map((name) => (
                <div key={name} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 h-8" />
                  <div className="p-1">
                    <div className="text-[8px] font-bold text-gray-900 truncate">{name}</div>
                    <div className="text-[8px] text-gray-400">¥3,500</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function PublicLPScreen() {
  return (
    <ScreenMockup title="ccagi.app/c/yamada/matcha-special">
      <div className="bg-indigo-700 text-white p-4 text-center">
        <div className="text-[9px] text-indigo-200 tracking-wider mb-1">SPECIAL SELECTION</div>
        <div className="text-base font-bold mb-1">京都の本格有機抹茶</div>
        <div className="text-[10px] text-indigo-200 mb-2">石臼挽き・カテキン豊富・有機JAS認証</div>
        <MockButton label="今すぐ購入する →" primary />
      </div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-2 mb-2 text-center">
          {["⭐ 有機JAS認証", "🍵 宇治産100%", "📦 即日発送"].map((f) => (
            <div key={f} className="bg-indigo-50 rounded-lg p-1.5 text-[9px] text-indigo-700 font-medium">{f}</div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-lg p-2 mb-2">
          <div className="text-[10px] font-bold text-gray-900 mb-1">お客様の声</div>
          <div className="text-[9px] text-gray-500 italic">&ldquo;毎朝の抹茶ラテが格段に美味しくなりました。リピート確定です！&rdquo;</div>
          <div className="text-[8px] text-gray-400 mt-0.5">— 東京都 M.T. 様</div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-gray-300 mt-1">ref=yamada で追跡中</div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function AnalyticsScreen() {
  return (
    <ScreenMockup title="creator.ccagi.app/analytics">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="アナリティクス" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">アナリティクス</div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <MockStatCard label="総閲覧数" value="45,800" />
            <MockStatCard label="総CV数" value="204" />
            <MockStatCard label="CV率" value="0.45%" />
            <MockStatCard label="累計報酬" value="¥182,400" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2">
            <div className="text-[10px] font-bold mb-1">閲覧数推移（過去30日）</div>
            {/* 簡易グラフ */}
            <div className="flex items-end gap-0.5 h-10">
              {[30, 45, 38, 52, 60, 48, 55, 70, 65, 80, 75, 90, 85, 95, 88, 72, 78, 82, 90, 95, 100, 92, 88, 85, 78, 82, 90, 95, 88, 92].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-indigo-400 rounded-t-sm min-w-0"
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <div className="text-[10px] font-bold mb-1">最近のコンバージョン</div>
            <MockTable
              headers={["日時", "LP", "商品", "金額", "報酬"]}
              rows={[
                ["3/15 14:23", "抹茶特集", "有機抹茶 x5", "¥18,900", "¥945"],
                ["3/15 11:05", "プロテイン比較", "玄米プロテイン x2", "¥7,600", "¥380"],
                ["3/14 20:41", "抹茶特集", "有機抹茶 x10", "¥37,800", "¥1,890"],
              ]}
            />
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}
