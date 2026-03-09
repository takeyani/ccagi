import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSurvey } from "../actions";
import { SurveyQuestionEditor } from "@/components/admin/SurveyQuestionEditor";
import type { Product, Lot } from "@/lib/types";

export default async function NewSurveyPage() {
  const supabase = await createSupabaseServerClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const { data: lots } = await supabase
    .from("lots")
    .select("id, lot_number, product_id")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アンケート作成</h1>

      <form action={createSurvey} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            name="title"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象タイプ
            </label>
            <select
              name="target_type"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="general">汎用</option>
              <option value="product">商品</option>
              <option value="lot">ロット</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象ID（商品/ロット選択時）
            </label>
            <select
              name="target_id"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">なし</option>
              <optgroup label="商品">
                {(products ?? []).map((p: Pick<Product, "id" | "name">) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="ロット">
                {(lots ?? []).map(
                  (l: Pick<Lot, "id" | "lot_number" | "product_id">) => (
                    <option key={l.id} value={l.id}>
                      {l.lot_number}
                    </option>
                  )
                )}
              </optgroup>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked />
          有効にする
        </label>

        <hr />

        <SurveyQuestionEditor />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          作成する
        </button>
      </form>
    </div>
  );
}
