"use client";

import { useState } from "react";
import type { Panel, DialogueEntry, SoundEffect } from "@/lib/types";

interface Props {
  panel: Panel;
  onSave: (panel: Panel) => void;
  onClose: () => void;
}

export default function DialogueEditor({ panel, onSave, onClose }: Props) {
  const [dialogue, setDialogue] = useState<DialogueEntry[]>(panel.dialogue);
  const [soundEffects, setSoundEffects] = useState<SoundEffect[]>(
    panel.sound_effects
  );
  const [sceneDesc, setSceneDesc] = useState(panel.scene_description);

  const addDialogue = () => {
    setDialogue([
      ...dialogue,
      {
        character_name: "",
        text: "",
        position: { x: 0.5, y: 0.1 },
        style: "speech",
      },
    ]);
  };

  const updateDialogue = (
    index: number,
    field: keyof DialogueEntry,
    value: string
  ) => {
    const updated = [...dialogue];
    updated[index] = { ...updated[index], [field]: value };
    setDialogue(updated);
  };

  const removeDialogue = (index: number) => {
    setDialogue(dialogue.filter((_, i) => i !== index));
  };

  const addSoundEffect = () => {
    setSoundEffects([
      ...soundEffects,
      { text: "", position: { x: 0.5, y: 0.5 }, rotation: 0 },
    ]);
  };

  const updateSoundEffect = (index: number, text: string) => {
    const updated = [...soundEffects];
    updated[index] = { ...updated[index], text };
    setSoundEffects(updated);
  };

  const removeSoundEffect = (index: number) => {
    setSoundEffects(soundEffects.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      ...panel,
      scene_description: sceneDesc,
      dialogue,
      sound_effects: soundEffects,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            パネル {panel.panel_order + 1} を編集
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Scene description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            シーン説明
          </label>
          <textarea
            value={sceneDesc}
            onChange={(e) => setSceneDesc(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dialogue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">セリフ</label>
            <button
              type="button"
              onClick={addDialogue}
              className="text-sm text-blue-600 hover:underline"
            >
              + 追加
            </button>
          </div>
          <div className="space-y-3">
            {dialogue.map((d, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={d.character_name}
                  onChange={(e) =>
                    updateDialogue(i, "character_name", e.target.value)
                  }
                  placeholder="キャラ名"
                  className="w-24 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  value={d.text}
                  onChange={(e) => updateDialogue(i, "text", e.target.value)}
                  placeholder="セリフ内容"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <select
                  value={d.style || "speech"}
                  onChange={(e) => updateDialogue(i, "style", e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="speech">通常</option>
                  <option value="thought">心の声</option>
                  <option value="narration">ナレーション</option>
                  <option value="shout">叫び</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeDialogue(i)}
                  className="text-red-500 hover:text-red-700 text-sm px-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sound effects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">効果音</label>
            <button
              type="button"
              onClick={addSoundEffect}
              className="text-sm text-blue-600 hover:underline"
            >
              + 追加
            </button>
          </div>
          <div className="space-y-2">
            {soundEffects.map((se, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={se.text}
                  onChange={(e) => updateSoundEffect(i, e.target.value)}
                  placeholder="ドカーン！ etc."
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSoundEffect(i)}
                  className="text-red-500 hover:text-red-700 text-sm px-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            保存
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
