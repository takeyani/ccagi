import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBuyerId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateAgent, deleteAgent, runAgent } from "../../actions";
import { ScoreBar } from "@/components/buyer/ScoreBar";
import { SpecRequirements } from "@/components/buyer/SpecRequirements";
import type { Tag } from "@/lib/types";

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { buyerId } = await requireBuyerId();
  const supabase = await createSupabaseServerClient();

  const [{ data: agent }, { data: tags }, { data: topResults }] =
    await Promise.all([
      supabase
        .from("buying_agents")
        .select("*")
        .eq("id", id)
        .eq("owner_id", buyerId)
        .single(),
      supabase
        .from("tags")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
      supabase
        .from("agent_results")
        .select(
          "*, products(name, slug, base_price), lots(lot_number, price, stock, status)"
        )
        .eq("agent_id", id)
        .order("total_score", { ascending: false })
        .limit(5),
    ]);

  if (!agent) notFound();

  // プレビュー結果のオークション情報を取得
  const previewLotIds = (topResults ?? []).map((r: { lot_id: string }) => r.lot_id);
  const previewAuctionMap: Record<string, { status: string }> = {};
  if (previewLotIds.length > 0) {
    const { data: previewAuctions } = await supabase
      .from("auctions")
      .select("lot_id, status")
      .in("lot_id", previewLotIds)
      .in("status", ["出品中", "落札済み"]);
    for (const a of previewAuctions ?? []) {
      previewAuctionMap[a.lot_id] = { status: a.status };
    }
  }

  const assignedTagIds = new Set(
    (agent.target_tag_ids as string[]) ?? []
  );

  const tagsByType = TAG_TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = (tags ?? []).filter((t: Tag) => t.tag_type === type);
      return acc;
    },
    {} as Record<string, Tag[]>
  );

  const updateWithId = updateAgent.bind(null, id);
  const deleteWithId = deleteAgent.bind(null, id);
  const runWithId = runAgent.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/buyer/agents" className="text-sm text-teal-600 hover:text-teal-800">← エージェント一覧に戻る</Link>
          <h1 className="text-2xl font-bold">エージェント編集</h1>
        </div>
        <div className="flex gap-2">
          <form action={runWithId}>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium text-sm"
            >
              エージェント実行
            </button>
          </form>
          <Link
            href={`/buyer/agents/${id}/results`}
            className="border border-teal-600 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 font-medium text-sm"
          >
            結果一覧
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={updateWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              エージェント名 *
            </label>
            <input
              name="name"
              required
              defaultValue={agent.name}
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
              defaultValue={agent.description ?? ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

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
                  defaultValue={agent.keyword ?? ""}
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
                  defaultValue={agent.min_price ?? ""}
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
                  defaultValue={agent.max_price ?? ""}
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
                <input
                  name="require_certified"
                  type="checkbox"
                  defaultChecked={agent.require_certified}
                />
                <span className="text-sm">認証済みパートナーのみ</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  name="require_entity_proof"
                  type="checkbox"
                  defaultChecked={agent.require_entity_proof}
                />
                <span className="text-sm">
                  主体証明（検証済み）が必須
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  name="require_product_proof"
                  type="checkbox"
                  defaultChecked={agent.require_product_proof}
                />
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
                defaultValue={agent.preferred_partner_type ?? ""}
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
            <SpecRequirements
              defaultValue={
                (agent.spec_requirements as { label: string; value: string }[]) ?? []
              }
            />
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
                              defaultChecked={assignedTagIds.has(tag.id)}
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

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              スコア重み設定
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  認証スコア重み
                </label>
                <input
                  name="certification_weight"
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={agent.certification_weight}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  証明チェーン重み
                </label>
                <input
                  name="proof_chain_weight"
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={agent.proof_chain_weight}
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
              <input
                name="require_in_stock"
                type="checkbox"
                defaultChecked={agent.require_in_stock}
              />
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
                defaultValue={agent.min_total_score ?? ""}
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
              <input
                name="auto_bid_enabled"
                type="checkbox"
                defaultChecked={agent.auto_bid_enabled}
              />
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
                defaultValue={agent.auto_bid_max_price ?? ""}
                placeholder="自動入札の最大金額"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                有効にする場合は必ず上限価格を設定してください
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium"
            >
              更新
            </button>
          </div>
        </form>

        <form action={deleteWithId} className="mt-4 pt-4 border-t">
          <button
            type="submit"
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            このエージェントを一時停止する
          </button>
        </form>
      </div>

      {/* 結果プレビュー */}
      {topResults && topResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">
            マッチング結果（上位5件）
          </h2>
          <div className="space-y-3">
            {/* eslint-disable @typescript-eslint/no-explicit-any */}
            {topResults.map((r: any) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {r.products?.name}
                    </p>
                    {previewAuctionMap[r.lot_id]?.status === "出品中" && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
                        オークション中
                      </span>
                    )}
                    {previewAuctionMap[r.lot_id]?.status === "落札済み" && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                        落札済み
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    ロット: {r.lots?.lot_number} / 在庫: {r.lots?.stock} /
                    価格: &yen;
                    {(r.lots?.price ?? r.products?.base_price)?.toLocaleString()}
                  </p>
                </div>
                <div className="w-48 space-y-1">
                  <ScoreBar label="認証" value={r.certification_score} />
                  <ScoreBar label="証明" value={r.proof_chain_score} />
                  <ScoreBar label="タグ" value={r.tag_match_score} />
                  <ScoreBar label="成分" value={r.spec_match_score} />
                  <ScoreBar label="価格" value={r.price_match_score} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-600">
                    {Number(r.total_score).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400">総合スコア</p>
                </div>
              </div>
            ))}
            {/* eslint-enable @typescript-eslint/no-explicit-any */}
          </div>
          <Link
            href={`/buyer/agents/${id}/results`}
            className="inline-block mt-3 text-teal-600 hover:text-teal-800 text-sm font-medium"
          >
            全結果を見る →
          </Link>
        </div>
      )}
    </div>
  );
}
