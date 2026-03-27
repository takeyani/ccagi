import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import CharacterForm from "@/components/characters/CharacterForm";
import { notFound } from "next/navigation";
import type { Character } from "@/lib/types";

export default async function CharacterEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">キャラクター編集</h1>
        <CharacterForm character={data as Character} />
      </div>
    </AppShell>
  );
}
