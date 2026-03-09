import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAgent } from "../../actions";
import { SpecRequirements } from "@/components/buyer/SpecRequirements";
import type { Tag } from "@/lib/types";

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

export default async function NewAgentPage() {
  const supabase = await createSupabaseServerClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  const tagsByType = TAG_TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = (tags ?? []).filter((t: Tag) => t.tag_type === type);
      return acc;
    },
    {} as Record<string, Tag[]>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">購買エージェント 新規作成</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={createAgent} className="space-y-4">
          {/* 基本情報 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              エージェント名 *
            </label>
            <input
              name="name"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              name="description"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* 検索条件 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              検索条件
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  キーワード
                </label>
                <input
                  name="keyword"
                  placeholder="商品名・説明に含まれるキーワード"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最低価格
                </label>
                <input
                  name="min_price"
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最高価格
                </label>
                <input
                  name="max_price"
                  type="number"
                  placeholder="100000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* 認証関係フィルタ */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              認証条件（絞り込み）
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input name="require_certified" type="checkbox" />
                <span className="text-sm">認証済みパートナーのみ</span>
              </label>
              <label className="flex items-center gap-2">
                <input name="require_entity_proof" type="checkbox" />
                <span className="text-sm">
                  主体証明（検証済み）が必須
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input name="require_product_proof" type="checkbox" />
                <span className="text-sm">
                  商品証明（検証済み）が必須
                </span>
              </label>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パートナー種別
              </label>
              <select
                name="preferred_partner_type"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">指定なし</option>
                <option value="メーカー">メーカー</option>
                <option value="代理店">代理店</option>
              </select>
            </div>
          </div>

          {/* 成分・特徴条件 */}
          <div className="border-t pt-4">
            <SpecRequirements />
          </div>

          {/* タグ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象タグ
            </label>
            <div className="space-y-3">
              {TAG_TYPE_ORDER.map(
                (type) =>
                  tagsByType[type].length > 0 && (
                    <div key={type}>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {type}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tagsByType[type].map((tag) => (
                          <label
                            key={tag.id}
                            className="flex items-center gap-1.5 px-2 py-1 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              name="tag_ids"
                              value={tag.id}
                            />
                            {tag.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* 重み設定 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              スコア重み設定
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  認証スコア重み: <span id="cert-val">80</span>
                </label>
                <input
                  name="certification_weight"
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  証明チェーン重み: <span id="proof-val">60</span>
                </label>
                <input
                  name="proof_chain_weight"
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              タグマッチ重み: 50（固定） / 価格マッチ重み: 30（固定）
            </p>
          </div>

          {/* その他条件 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              その他条件
            </h3>
            <label className="flex items-center gap-2">
              <input name="require_in_stock" type="checkbox" defaultChecked />
              <span className="text-sm">在庫ありの商品のみ対象にする</span>
            </label>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最低総合スコア
              </label>
              <input
                name="min_total_score"
                type="number"
                min="0"
                max="100"
                placeholder="指定なし（0-100）"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* 自動入札設定 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              自動入札設定
            </h3>
            <label className="flex items-center gap-2">
              <input name="auto_bid_enabled" type="checkbox" />
              <span className="text-sm">
                マッチした商品のオークションに自動入札する
              </span>
            </label>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自動入札上限価格
              </label>
              <input
                name="auto_bid_max_price"
                type="number"
                min="0"
                placeholder="自動入札の最大金額"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                有効にする場合は必ず上限価格を設定してください
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium"
          >
            作成
          </button>
        </form>
      </div>
    </div>
  );
}
