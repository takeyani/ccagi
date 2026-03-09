"use client";

import Link from "next/link";

type Props = {
  fileName: string;
  fileId: string;
  onFitView: () => void;
  onViewAngle: (angle: "front" | "top" | "right") => void;
  onToggleWireframe: () => void;
  wireframe: boolean;
  showTree: boolean;
  onToggleTree: () => void;
  showProps: boolean;
  onToggleProps: () => void;
};

export function Toolbar({
  fileName,
  onFitView,
  onViewAngle,
  onToggleWireframe,
  wireframe,
  showTree,
  onToggleTree,
  showProps,
  onToggleProps,
}: Props) {
  const btnClass =
    "px-3 py-1.5 rounded text-sm font-medium transition-colors";
  const btnDefault = `${btnClass} bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white`;
  const btnActive = `${btnClass} bg-blue-600 text-white`;

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2 shrink-0">
      <Link
        href="/dashboard"
        className="text-gray-400 hover:text-white mr-2 text-sm"
      >
        ← 戻る
      </Link>

      <span className="text-white font-medium text-sm truncate max-w-48">
        {fileName}
      </span>

      <div className="w-px h-6 bg-gray-600 mx-2" />

      <button onClick={onFitView} className={btnDefault} title="全体表示">
        全体表示
      </button>

      <button
        onClick={() => onViewAngle("front")}
        className={btnDefault}
        title="正面"
      >
        正面
      </button>
      <button
        onClick={() => onViewAngle("top")}
        className={btnDefault}
        title="上面"
      >
        上面
      </button>
      <button
        onClick={() => onViewAngle("right")}
        className={btnDefault}
        title="側面"
      >
        側面
      </button>

      <div className="w-px h-6 bg-gray-600 mx-2" />

      <button
        onClick={onToggleWireframe}
        className={wireframe ? btnActive : btnDefault}
        title="ワイヤーフレーム"
      >
        ワイヤー
      </button>

      <div className="flex-1" />

      <button
        onClick={onToggleTree}
        className={showTree ? btnActive : btnDefault}
        title="モデルツリー"
      >
        ツリー
      </button>
      <button
        onClick={onToggleProps}
        className={showProps ? btnActive : btnDefault}
        title="プロパティ"
      >
        プロパティ
      </button>
    </div>
  );
}
