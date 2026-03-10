"use client";

import { useState, useCallback } from "react";
import { ModelViewer } from "./ModelViewer";
import { ModelTree, type TreeNode } from "./ModelTree";
import { PropertiesPanel, type PropertyGroup } from "./PropertiesPanel";
import { Toolbar } from "./Toolbar";

type Props = {
  fileId: string;
  fileName: string;
  fileUrl: string | null;
};

export default function ViewerClient({ fileId, fileName, fileUrl }: Props) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [properties, setProperties] = useState<PropertyGroup[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showTree, setShowTree] = useState(true);
  const [showProps, setShowProps] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewerApi, setViewerApi] = useState<any>(null);

  const handleModelLoaded = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api: any) => {
      setViewerApi(api);
      if (api.getTree) {
        setTreeData(api.getTree());
      }
    },
    []
  );

  const handleElementSelected = useCallback(
    (id: number | null, props: PropertyGroup[]) => {
      setSelectedId(id);
      setProperties(props);
    },
    []
  );

  const handleTreeSelect = useCallback(
    (id: number) => {
      if (viewerApi?.selectElement) {
        viewerApi.selectElement(id);
      }
    },
    [viewerApi]
  );

  const handleFitView = useCallback(() => {
    viewerApi?.fitView?.();
  }, [viewerApi]);

  const handleViewAngle = useCallback(
    (angle: "front" | "top" | "right") => {
      viewerApi?.setViewAngle?.(angle);
    },
    [viewerApi]
  );

  const handleToggleWireframe = useCallback(() => {
    const next = !wireframe;
    setWireframe(next);
    viewerApi?.setWireframe?.(next);
  }, [wireframe, viewerApi]);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900">
      <Toolbar
        fileName={fileName}
        fileId={fileId}
        onFitView={handleFitView}
        onViewAngle={handleViewAngle}
        onToggleWireframe={handleToggleWireframe}
        wireframe={wireframe}
        showTree={showTree}
        onToggleTree={() => setShowTree(!showTree)}
        showProps={showProps}
        onToggleProps={() => setShowProps(!showProps)}
      />

      <div className="flex flex-1 overflow-hidden">
        {showTree && (
          <div className="w-72 bg-gray-800 text-white overflow-y-auto border-r border-gray-700">
            <ModelTree
              nodes={treeData}
              selectedId={selectedId}
              onSelect={handleTreeSelect}
            />
          </div>
        )}

        <div className="flex-1 relative" style={{ minHeight: 0, minWidth: 0 }}>
          <ModelViewer
            fileUrl={fileUrl}
            fileName={fileName}
            onModelLoaded={handleModelLoaded}
            onElementSelected={handleElementSelected}
          />
        </div>

        {showProps && (
          <div className="w-80 bg-gray-800 text-white overflow-y-auto border-l border-gray-700">
            <PropertiesPanel properties={properties} selectedId={selectedId} />
          </div>
        )}
      </div>
    </div>
  );
}
