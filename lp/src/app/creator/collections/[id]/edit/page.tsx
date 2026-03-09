"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { CreatorLPCollection } from "@/lib/types";
import { CollectionEditor } from "@/components/creator-lp/editor/CollectionEditor";

export default function EditCollectionPage() {
  const params = useParams();
  const id = params.id as string;
  const [collection, setCollection] = useState<CreatorLPCollection | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error: err } = await getSupabase()
        .from("creator_lp_collections")
        .select("*")
        .eq("id", id)
        .single();

      if (err || !data) {
        setError("コレクションが見つかりません");
        return;
      }

      setCollection(data as CreatorLPCollection);
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return <CollectionEditor collection={collection} />;
}
