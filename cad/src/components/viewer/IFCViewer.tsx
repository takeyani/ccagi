"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as WebIFC from "web-ifc";
import type { TreeNode } from "./ModelTree";
import type { PropertyGroup } from "./PropertiesPanel";

type ViewerApi = {
  getTree: () => TreeNode[];
  selectElement: (expressId: number) => void;
  fitView: () => void;
  setViewAngle: (angle: "front" | "top" | "right") => void;
  setWireframe: (enabled: boolean) => void;
};

type Props = {
  fileUrl: string | null;
  onModelLoaded: (api: ViewerApi) => void;
  onElementSelected: (
    expressId: number | null,
    properties: PropertyGroup[]
  ) => void;
};

export function IFCViewer({ fileUrl, onModelLoaded, onElementSelected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);
  const onModelLoadedRef = useRef(onModelLoaded);
  onModelLoadedRef.current = onModelLoaded;
  const onElementSelectedRef = useRef(onElementSelected);
  onElementSelectedRef.current = onElementSelected;

  useEffect(() => {
    if (!containerRef.current || initedRef.current) return;
    initedRef.current = true;
    const container = containerRef.current;

    console.log("[IFCViewer] Init start, container size:", container.clientWidth, "x", container.clientHeight);

    // Three.js setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
    camera.position.set(20, 20, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-50, 50, -50);
    scene.add(dirLight2);

    // Grid
    const grid = new THREE.GridHelper(100, 100, 0x444444, 0x333333);
    scene.add(grid);

    // Animation loop
    let animating = true;
    function animate() {
      if (!animating) return;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    });
    resizeObserver.observe(container);

    // Model group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    const treeNodes: TreeNode[] = [];

    // Selection state
    let lastSelected: THREE.Mesh | null = null;
    let lastMaterial: THREE.Material | THREE.Material[] | null = null;

    // Click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener("click", (event: MouseEvent) => {
      // Restore previous selection
      if (lastSelected && lastMaterial) {
        lastSelected.material = lastMaterial;
        lastSelected = null;
        lastMaterial = null;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(modelGroup, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;

        // Highlight
        if (hit.material) {
          lastSelected = hit;
          lastMaterial = hit.material;
          hit.material = new THREE.MeshStandardMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.8,
          });
        }

        const props: PropertyGroup[] = [
          {
            groupName: "基本情報",
            properties: [
              { name: "名前", value: hit.name || "不明" },
              { name: "タイプ", value: hit.userData.ifcType || hit.type },
              { name: "Express ID", value: String(hit.userData.expressId ?? hit.id) },
            ],
          },
          {
            groupName: "ジオメトリ",
            properties: [
              { name: "位置", value: `(${hit.position.x.toFixed(2)}, ${hit.position.y.toFixed(2)}, ${hit.position.z.toFixed(2)})` },
            ],
          },
        ];

        const box = new THREE.Box3().setFromObject(hit);
        const size = box.getSize(new THREE.Vector3());
        props.push({
          groupName: "サイズ",
          properties: [
            { name: "幅 (X)", value: `${size.x.toFixed(3)} m` },
            { name: "高さ (Y)", value: `${size.y.toFixed(3)} m` },
            { name: "奥行 (Z)", value: `${size.z.toFixed(3)} m` },
          ],
        });

        onElementSelectedRef.current(hit.userData.expressId ?? hit.id, props);
      } else {
        onElementSelectedRef.current(null, []);
      }
    });

    // Camera helpers
    function fitCameraToModel() {
      if (modelGroup.children.length === 0) return;
      const bbox = new THREE.Box3().setFromObject(modelGroup);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const dist = maxDim * 1.5;
      camera.position.set(center.x + dist, center.y + dist * 0.7, center.z + dist);
      controls.target.copy(center);
      controls.update();
    }

    function setViewAngle(angle: "front" | "top" | "right") {
      if (modelGroup.children.length === 0) return;
      const bbox = new THREE.Box3().setFromObject(modelGroup);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      const dist = Math.max(size.x, size.y, size.z) * 1.5;
      controls.target.copy(center);
      switch (angle) {
        case "front": camera.position.set(center.x, center.y, center.z + dist); break;
        case "top": camera.position.set(center.x, center.y + dist, center.z + 0.01); break;
        case "right": camera.position.set(center.x + dist, center.y, center.z); break;
      }
      controls.update();
    }

    // IFC loading with web-ifc
    async function loadIFCData(data: Uint8Array) {
      console.log("[IFCViewer] Initializing web-ifc, data size:", data.byteLength);

      const ifcApi = new WebIFC.IfcAPI();
      ifcApi.SetWasmPath("https://unpkg.com/web-ifc@0.0.77/", true);
      await ifcApi.Init();
      console.log("[IFCViewer] web-ifc initialized");

      const modelID = ifcApi.OpenModel(data);
      console.log("[IFCViewer] Model opened, ID:", modelID);

      // Get all meshes
      ifcApi.StreamAllMeshes(modelID, (mesh) => {
        const placedGeometries = mesh.geometries;

        for (let i = 0; i < placedGeometries.size(); i++) {
          const placedGeometry = placedGeometries.get(i);
          const ifcGeometry = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID);

          const verts = ifcApi.GetVertexArray(
            ifcGeometry.GetVertexData(),
            ifcGeometry.GetVertexDataSize()
          );
          const indices = ifcApi.GetIndexArray(
            ifcGeometry.GetIndexData(),
            ifcGeometry.GetIndexDataSize()
          );

          if (verts.length === 0 || indices.length === 0) {
            ifcGeometry.delete();
            continue;
          }

          // Build Three.js geometry (6 floats per vertex: x,y,z,nx,ny,nz)
          const positions = new Float32Array(verts.length / 2);
          const normals = new Float32Array(verts.length / 2);
          for (let j = 0; j < verts.length; j += 6) {
            const idx = j / 2;
            positions[idx] = verts[j];
            positions[idx + 1] = verts[j + 1];
            positions[idx + 2] = verts[j + 2];
            normals[idx] = verts[j + 3];
            normals[idx + 1] = verts[j + 4];
            normals[idx + 2] = verts[j + 5];
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
          geometry.setIndex(new THREE.BufferAttribute(indices, 1));

          // Color from IFC
          const color = placedGeometry.color;
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color.x, color.y, color.z),
            transparent: color.w < 1,
            opacity: color.w,
            side: THREE.DoubleSide,
          });

          const threeMesh = new THREE.Mesh(geometry, material);

          // Apply transform
          const matrix = new THREE.Matrix4();
          matrix.fromArray(placedGeometry.flatTransformation);
          threeMesh.applyMatrix4(matrix);

          threeMesh.userData.expressId = mesh.expressID;
          threeMesh.name = `IFC_${mesh.expressID}`;

          modelGroup.add(threeMesh);

          ifcGeometry.delete();
        }
      });

      console.log("[IFCViewer] Meshes loaded:", modelGroup.children.length);

      // Build tree nodes
      treeNodes.length = 0;
      modelGroup.children.forEach((child) => {
        treeNodes.push({
          id: child.userData.expressId ?? child.id,
          name: child.name || `Object ${child.id}`,
          type: "Mesh",
          children: [],
        });
      });

      // Try to get IFC type info for tree
      try {
        const types = [
          WebIFC.IFCWALL, WebIFC.IFCSLAB, WebIFC.IFCCOLUMN,
          WebIFC.IFCBEAM, WebIFC.IFCDOOR, WebIFC.IFCWINDOW,
          WebIFC.IFCSTAIR, WebIFC.IFCROOF, WebIFC.IFCRAILING,
          WebIFC.IFCFURNISHINGELEMENT, WebIFC.IFCFLOWSEGMENT,
          WebIFC.IFCFLOWTERMINAL, WebIFC.IFCSPACE,
          WebIFC.IFCBUILDINGELEMENTPROXY,
        ];

        for (const typeId of types) {
          try {
            const ids = ifcApi.GetLineIDsWithType(modelID, typeId);
            for (let i = 0; i < ids.size(); i++) {
              const expressId = ids.get(i);
              const props = ifcApi.GetLine(modelID, expressId);
              const typeName = props?.constructor?.name || "Unknown";

              // Update mesh userData
              modelGroup.children.forEach((child) => {
                if (child.userData.expressId === expressId) {
                  child.userData.ifcType = typeName;
                  child.name = props?.Name?.value || child.name;
                }
              });
            }
          } catch {
            // Some types may not exist
          }
        }
      } catch (e) {
        console.warn("[IFCViewer] Could not read IFC types:", e);
      }

      ifcApi.CloseModel(modelID);
      fitCameraToModel();

      console.log("[IFCViewer] Done loading IFC");
    }

    // Viewer API
    const viewerApi: ViewerApi = {
      getTree: () => [...treeNodes],
      selectElement: (expressId: number) => {
        modelGroup.children.forEach((child) => {
          if (child.userData.expressId === expressId) {
            const box = new THREE.Box3().setFromObject(child);
            const center = box.getCenter(new THREE.Vector3());
            controls.target.copy(center);
            controls.update();
          }
        });
      },
      fitView: fitCameraToModel,
      setViewAngle,
      setWireframe: (enabled: boolean) => {
        modelGroup.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => {
                if ("wireframe" in m) (m as THREE.MeshStandardMaterial).wireframe = enabled;
              });
            } else if ("wireframe" in mesh.material) {
              (mesh.material as THREE.MeshStandardMaterial).wireframe = enabled;
            }
          }
        });
      },
    };

    // Load
    if (fileUrl) {
      console.log("[IFCViewer] Fetching:", fileUrl);
      fetch(fileUrl)
        .then((res) => {
          console.log("[IFCViewer] Fetch status:", res.status);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buf) => {
          console.log("[IFCViewer] Fetched bytes:", buf.byteLength);
          return loadIFCData(new Uint8Array(buf));
        })
        .then(() => {
          onModelLoadedRef.current(viewerApi);
        })
        .catch((err) => console.error("[IFCViewer] Error:", err));
    } else {
      // Local test mode
      onModelLoadedRef.current({ ...viewerApi, getTree: () => [] });

      container.addEventListener("dragover", (e) => e.preventDefault());
      container.addEventListener("drop", (e: DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if (file?.name.toLowerCase().endsWith(".ifc")) {
          file.arrayBuffer().then((buf) =>
            loadIFCData(new Uint8Array(buf)).then(() =>
              onModelLoadedRef.current(viewerApi)
            )
          );
        }
      });
      container.addEventListener("localFileSelected", ((e: CustomEvent) => {
        const file = e.detail as File;
        file.arrayBuffer().then((buf) =>
          loadIFCData(new Uint8Array(buf)).then(() =>
            onModelLoadedRef.current(viewerApi)
          )
        );
      }) as EventListener);
    }

    return () => {
      animating = false;
      initedRef.current = false;
      resizeObserver.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [fileUrl]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {!fileUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-gray-800/80 text-white px-6 py-4 rounded-xl text-center pointer-events-auto">
            <p className="text-lg font-medium mb-2">ローカルテストモード</p>
            <p className="text-sm text-gray-300 mb-3">
              IFCファイルをドラッグ&ドロップして読み込みます
            </p>
            <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer text-sm">
              ファイルを選択
              <input
                type="file"
                accept=".ifc"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && containerRef.current) {
                    containerRef.current.dispatchEvent(
                      new CustomEvent("localFileSelected", { detail: file })
                    );
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
