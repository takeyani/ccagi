"use client";

import { useState } from "react";

export type TreeNode = {
  id: number;
  name: string;
  type: string;
  children: TreeNode[];
};

type Props = {
  nodes: TreeNode[];
  selectedId: number | null;
  onSelect: (expressId: number) => void;
};

function TreeItem({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: {
  node: TreeNode;
  selectedId: number | null;
  onSelect: (expressId: number) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-700 text-sm ${
          isSelected ? "bg-blue-600/30 text-blue-300" : "text-gray-300"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            className="w-4 h-4 flex items-center justify-center text-xs text-gray-500 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? "▼" : "▶"}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="truncate">{node.name}</span>
        <span className="text-xs text-gray-500 ml-auto shrink-0">
          {node.type}
        </span>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ModelTree({ nodes, selectedId, onSelect }: Props) {
  return (
    <div className="p-2">
      <h3 className="text-sm font-semibold px-2 py-2 text-gray-400 uppercase tracking-wider">
        モデルツリー
      </h3>
      {nodes.length === 0 ? (
        <p className="text-gray-500 text-sm px-2 py-4">
          モデルが読み込まれていません
        </p>
      ) : (
        nodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  );
}
