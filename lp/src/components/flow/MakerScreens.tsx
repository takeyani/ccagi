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

const sidebarItems = ["ダッシュボード", "商品管理", "プルーフ", "問い合わせ", "帳票", "グループウェア", "設定"];

export function MakerDashboardScreen() {
  return (
    <ScreenMockup title="partner.ccagi.app/dashboard">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="ダッシュボード" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">ダッシュボード</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <MockStatCard label="登録商品数" value="12" />
            <MockStatCard label="今月の問い合わせ" value="8" />
            <MockStatCard label="今月の受注" value="¥1,240,000" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <div className="text-[10px] font-bold mb-1.5">最近の問い合わせ</div>
            <MockTable
              headers={["日付", "バイヤー", "商品", "ステータス"]}
              rows={[
                ["3/14", "ABC商事", "有機抹茶パウダー", ""],
                ["3/13", "DEF食品", "玄米プロテイン", ""],
                ["3/12", "GHI貿易", "柚子エキス", ""],
              ]}
            />
            <div className="flex gap-4 mt-1 ml-2">
              <span /><span /><span /><span className="flex gap-1">
                <MockBadge label="新規" color="blue" />
                <MockBadge label="対応中" color="yellow" />
                <MockBadge label="承諾" color="green" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function ProductRegistrationScreen() {
  return (
    <ScreenMockup title="partner.ccagi.app/products/new">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="商品管理" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">新規商品登録</div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            {/* 基本情報 */}
            <div className="text-[9px] font-bold text-gray-500 border-b border-gray-100 pb-0.5">基本情報</div>
            <div className="grid grid-cols-2 gap-2">
              <MockFormField label="商品名 *" placeholder="例: 有機抹茶パウダー" />
              <MockFormField label="商品名マスタ" placeholder="管理用の正式名称" />
              <MockFormField label="スラッグ *" placeholder="organic-matcha" />
              <MockFormField label="品番" placeholder="MT-001" />
              <MockFormField label="JAN CODE" placeholder="4901234567890" />
              <MockFormField label="原産国" placeholder="日本" />
            </div>
            {/* カテゴリ */}
            <div className="text-[9px] font-bold text-gray-500 border-b border-gray-100 pb-0.5 pt-1">カテゴリ</div>
            <div className="grid grid-cols-3 gap-2">
              <MockFormField label="カテゴリ①" placeholder="食品" />
              <MockFormField label="カテゴリ②" placeholder="茶・飲料" />
              <MockFormField label="カテゴリ③" placeholder="抹茶" />
            </div>
            {/* 価格・数量 */}
            <div className="text-[9px] font-bold text-gray-500 border-b border-gray-100 pb-0.5 pt-1">価格・数量</div>
            <div className="grid grid-cols-3 gap-2">
              <MockFormField label="卸売価格（税抜）*" placeholder="¥3,500" />
              <MockFormField label="カートン入数" placeholder="24" />
              <MockFormField label="最小注文数量" placeholder="10" />
            </div>
            {/* サイズ・重量 */}
            <div className="text-[9px] font-bold text-gray-500 border-b border-gray-100 pb-0.5 pt-1">サイズ・重量</div>
            <div className="grid grid-cols-5 gap-1">
              <MockFormField label="W (mm)" placeholder="80" />
              <MockFormField label="D (mm)" placeholder="50" />
              <MockFormField label="H (mm)" placeholder="150" />
              <MockFormField label="N.W (kg)" placeholder="0.10" />
              <MockFormField label="G.W (kg)" placeholder="0.12" />
            </div>
            {/* 詳細情報 */}
            <div className="text-[9px] font-bold text-gray-500 border-b border-gray-100 pb-0.5 pt-1">詳細情報</div>
            <MockFormField label="説明" placeholder="商品の特徴や仕様を入力..." type="textarea" />
            <MockFormField label="素材・成分" placeholder="有機抹茶100%（京都府産）" />
            {/* 画像 */}
            <div className="text-[9px] font-bold text-gray-500 border-b border-gray-100 pb-0.5 pt-1">画像</div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-8 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-[8px] text-gray-300">画像1</div>
              <div className="h-8 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-[8px] text-gray-300">画像2</div>
              <div className="h-8 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-[8px] text-gray-300">画像3</div>
            </div>
            {/* フラグ */}
            <div className="flex gap-3 pt-1">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 border border-gray-300 rounded-sm bg-indigo-500" />
                <span className="text-[9px] text-gray-600">有効</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 border border-gray-300 rounded-sm" />
                <span className="text-[9px] text-gray-600">新商品・リニューアル</span>
              </div>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <MockButton label="下書き保存" />
              <MockButton label="登録する" primary />
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function LotManagementScreen() {
  return (
    <ScreenMockup title="partner.ccagi.app/products/lot-management">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="商品管理" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-sm text-gray-900">有機抹茶パウダー - ロット管理</div>
            <MockButton label="+ 新規ロット" primary />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <MockTable
              headers={["ロット番号", "在庫数", "単価", "有効期限", "ステータス"]}
              rows={[
                ["LOT-2026-001", "500", "¥3,500", "2026/09/30", ""],
                ["LOT-2026-002", "200", "¥3,300", "2026/06/15", ""],
                ["LOT-2025-012", "0", "¥3,500", "2025/12/31", ""],
              ]}
            />
            <div className="flex gap-16 ml-2 -mt-1 mb-1">
              <span /><span /><span /><span /><span className="flex gap-1">
                <MockBadge label="販売中" color="green" />
                <MockBadge label="販売中" color="green" />
                <MockBadge label="期限切れ" color="red" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function ProofChainScreen() {
  return (
    <ScreenMockup title="partner.ccagi.app/proofs">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="プルーフ" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">5層プルーフチェーン</div>
          <div className="space-y-1.5">
            {[
              { layer: "L1", name: "事業者証明", status: "verified", files: "営業許可証.pdf" },
              { layer: "L2", name: "商品証明", status: "verified", files: "成分分析書.pdf, 検査結果.pdf" },
              { layer: "L3", name: "在庫証明", status: "pending", files: "WMS連携設定中" },
              { layer: "L4", name: "所有権履歴", status: "auto", files: "自動記録（3件）" },
              { layer: "L5", name: "配送証明", status: "none", files: "未登録" },
            ].map((p) => (
              <div key={p.layer} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                  {p.layer}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-gray-900">{p.name}</div>
                  <div className="text-[9px] text-gray-400">{p.files}</div>
                </div>
                <MockBadge
                  label={p.status === "verified" ? "認証済み" : p.status === "pending" ? "確認中" : p.status === "auto" ? "自動" : "未登録"}
                  color={p.status === "verified" ? "green" : p.status === "pending" ? "yellow" : p.status === "auto" ? "blue" : "gray"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function InquiryScreen() {
  return (
    <ScreenMockup title="partner.ccagi.app/inquiries/INQ-001">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="問い合わせ" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-bold text-sm text-gray-900">問い合わせ詳細</div>
            <MockBadge label="新規" color="blue" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-gray-400">バイヤー：</span><span className="font-medium">ABC商事</span></div>
              <div><span className="text-gray-400">商品：</span><span className="font-medium">有機抹茶パウダー</span></div>
              <div><span className="text-gray-400">希望数量：</span><span className="font-medium">100個</span></div>
              <div><span className="text-gray-400">希望価格：</span><span className="font-medium">¥3,200/個</span></div>
            </div>
            <div className="mt-2 text-[10px]">
              <span className="text-gray-400">備考：</span>
              <span className="text-gray-600">サンプル5個を先に送付いただけますか？</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <MockButton label="承諾する" primary />
            <MockButton label="辞退する" />
            <MockButton label="見積書を作成" />
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}

export function InvoiceScreen() {
  return (
    <ScreenMockup title="partner.ccagi.app/invoices/new">
      <div className="flex">
        <MockSidebar items={sidebarItems} active="帳票" />
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-sm mb-2 text-gray-900">請求書作成</div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <MockFormField label="宛先" placeholder="ABC商事 御中" />
              <MockFormField label="請求日" placeholder="2026/03/15" />
            </div>
            <div className="text-[9px] font-medium text-gray-600 mb-1">明細</div>
            <MockTable
              headers={["品名", "数量", "単価", "税率", "小計"]}
              rows={[
                ["有機抹茶パウダー", "100", "¥3,200", "8%", "¥345,600"],
                ["送料", "1", "¥2,000", "10%", "¥2,200"],
              ]}
            />
            <div className="text-right text-[10px] mt-1 font-bold text-gray-900">合計: ¥347,800（税込）</div>
            <div className="flex justify-end gap-1.5 mt-2">
              <MockButton label="PDF出力" />
              <MockButton label="発行する" primary />
            </div>
          </div>
        </div>
      </div>
    </ScreenMockup>
  );
}
