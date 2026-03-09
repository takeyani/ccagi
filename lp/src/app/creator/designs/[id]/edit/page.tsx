"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { CreatorLPDesign } from "@/lib/types";
import { LPEditor } from "@/components/creator-lp/editor/LPEditor";

export default function EditDesignPage() {
  const params = useParams();
  const id = params.id as string;
  const [design, setDesign] = useState<CreatorLPDesign | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error: err } = await getSupabase()
        .from("creator_lp_designs")
        .select("*")
        .eq("id", id)
        .single();

      if (err || !data) {
        setError("デザインが見つかりません");
        return;
      }

      setDesign(data as CreatorLPDesign);
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

  if (!design) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return <LPEditor design={design} />;
}
