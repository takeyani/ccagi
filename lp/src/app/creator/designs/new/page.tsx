"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Product, Lot } from "@/lib/types";
import { createDesign } from "../actions";

export default function NewDesignPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await getSupabase()
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");
      setProducts((data as Product[]) ?? []);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProductId) {
      setLots([]);
      setSelectedLotId("");
      return;
    }
    const loadLots = async () => {
      const { data } = await getSupabase()
        .from("lots")
        .select("*")
        .eq("product_id", selectedProductId)
        .order("created_at", { ascending: false });
      setLots((data as Lot[]) ?? []);
      setSelectedLotId("");
    };
    loadLots();
  }, [selectedProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedLotId) return;
    setLoading(true);
    setError("");

    try {
      const code = localStorage.getItem("creator_code");
      if (!code) throw new Error("Not authenticated");

      const { data: affiliate } = await getSupabase()
        .from("affiliates")
        .select("id")
        .eq("code", code)
        .single();

      if (!affiliate) throw new Error("Affiliate not found");

      const product = products.find((p) => p.id === selectedProductId);
      if (!product) throw new Error("Product not found");

      const result = await createDesign({
        affiliateId: affiliate.id,
        productId: selectedProductId,
        lotId: selectedLotId,
        slug: product.slug,
      });

      router.push(`/creator/designs/${result.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規デザイン作成</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg rounded-2xl bg-white p-6 shadow-sm border"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品を選択
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            >
              <option value="">-- 商品を選択してください --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProductId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ロットを選択
              </label>
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              >
                <option value="">-- ロットを選択してください --</option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lot_number} - {l.status}
                    {l.price ? ` (¥${l.price.toLocaleString()})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !selectedProductId || !selectedLotId}
          className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "作成中..." : "デザインを作成してエディターを開く"}
        </button>
      </form>
    </div>
  );
}
