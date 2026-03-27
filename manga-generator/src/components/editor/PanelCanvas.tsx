"use client";

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import SortablePanel from "./SortablePanel";
import DialogueEditor from "./DialogueEditor";
import type { Panel } from "@/lib/types";

interface Props {
  panels: Panel[];
  onPanelsChange: (panels: Panel[]) => void;
  onRegenerate: (panelId: string) => void;
}

export default function PanelCanvas({
  panels,
  onPanelsChange,
  onRegenerate,
}: Props) {
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = panels.findIndex((p) => p.id === active.id);
    const newIndex = panels.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(panels, oldIndex, newIndex).map((p, i) => ({
      ...p,
      panel_order: i,
    }));
    onPanelsChange(reordered);
  };

  const handlePanelSave = (updatedPanel: Panel) => {
    onPanelsChange(
      panels.map((p) => (p.id === updatedPanel.id ? updatedPanel : p))
    );
    setEditingPanel(null);
  };

  const exportToPng = useCallback(async () => {
    if (!canvasRef.current) return;
    const dataUrl = await toPng(canvasRef.current, { quality: 0.95 });
    const link = document.createElement("a");
    link.download = "manga.png";
    link.href = dataUrl;
    link.click();
  }, []);

  const exportToPdf = useCallback(async () => {
    if (!canvasRef.current) return;
    const dataUrl = await toPng(canvasRef.current, { quality: 0.95 });
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("manga.pdf");
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-500">
          {panels.length} パネル
        </span>
        <div className="flex-1" />
        <button
          onClick={exportToPng}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          PNG出力
        </button>
        <button
          onClick={exportToPdf}
          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          PDF出力
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="bg-white border rounded-lg p-4"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={panels.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {panels
                .sort((a, b) => a.panel_order - b.panel_order)
                .map((panel) => (
                  <SortablePanel
                    key={panel.id}
                    panel={panel}
                    onEdit={setEditingPanel}
                    onRegenerate={onRegenerate}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Dialogue Editor Modal */}
      {editingPanel && (
        <DialogueEditor
          panel={editingPanel}
          onSave={handlePanelSave}
          onClose={() => setEditingPanel(null)}
        />
      )}
    </div>
  );
}
