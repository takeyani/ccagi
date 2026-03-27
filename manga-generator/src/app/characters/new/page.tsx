import AppShell from "@/components/AppShell";
import CharacterForm from "@/components/characters/CharacterForm";

export default function NewCharacterPage() {
  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">キャラクター作成</h1>
        <CharacterForm />
      </div>
    </AppShell>
  );
}
