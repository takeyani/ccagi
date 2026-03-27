"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Panel } from "@/lib/types";

interface Props {
  panel: Panel;
  onEdit: (panel: Panel) => void;
  onRegenerate: (panelId: string) => void;
}

export default function SortablePanel({ panel, onEdit, onRegenerate }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-white rounded-lg border shadow-sm overflow-hidden group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-white/80 rounded cursor-grab active:cursor-grabbing"
      >
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4" cy="3" r="1.5" />
          <circle cx="12" cy="3" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
          <circle cx="4" cy="13" r="1.5" />
          <circle cx="12" cy="13" r="1.5" />
        </svg>
      </div>

      {/* Panel image */}
      <div className="aspect-square bg-gray-100">
        {panel.image_url ? (
          <img
            src={panel.image_url}
            alt={`パネル ${panel.panel_order + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            画像なし
          </div>
        )}
      </div>

      {/* Dialogue overlay */}
      {panel.dialogue.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 max-h-24 overflow-y-auto">
          {panel.dialogue.map((d, i) => (
            <div key={i} className="text-xs mb-1">
              <span className="font-medium">{d.character_name}: </span>
              <span>{d.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons (shown on hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(panel)}
          className="p-1 bg-white/90 rounded text-xs text-blue-600 hover:bg-blue-50"
        >
          編集
        </button>
        <button
          onClick={() => onRegenerate(panel.id)}
          className="p-1 bg-white/90 rounded text-xs text-green-600 hover:bg-green-50"
        >
          再生成
        </button>
      </div>

      {/* Panel number */}
      <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs">
        {panel.panel_order + 1}
      </div>
    </div>
  );
}
