"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as WebIFC from "web-ifc";
import { getFormatFromFileName, isSupportedFormat, ACCEPT_STRING } from "@/lib/formats";
import type { TreeNode } from "./ModelTree";
import type { PropertyGroup } from "./PropertiesPanel";

type ViewerApi = {
  getTree: () => TreeNode[];
  selectElement: (id: number) => void;
  fitView: () => void;
  setViewAngle: (angle: "front" | "top" | "right") => void;
  setWireframe: (enabled: boolean) => void;
};

type Props = {
  fileUrl: string | null;
  fileName: string;
  onModelLoaded: (api: ViewerApi) => void;
  onElementSelected: (
    id: number | null,
    properties: PropertyGroup[]
  ) => void;
};

// ── Three.js loader helpers (dynamic import to split bundles) ──

async function loadGLTF(url: string): Promise<THREE.Group> {
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

async function loadFBX(url: string): Promise<THREE.Group> {
  const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
  return new Promise((resolve, reject) => {
    new FBXLoader().load(url, (group) => resolve(group), undefined, reject);
  });
}

async function loadOBJ(url: string): Promise<THREE.Group> {
  const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
  return new Promise((resolve, reject) => {
    new OBJLoader().load(url, (group) => resolve(group), undefined, reject);
  });
}

async function loadSTL(url: string): Promise<THREE.Group> {
  const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
  return new Promise((resolve, reject) => {
    new STLLoader().load(
      url,
      (geometry) => {
        const material = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "STL Model";
        const group = new THREE.Group();
        group.add(mesh);
        resolve(group);
      },
      undefined,
      reject
    );
  });
}

async function loadCollada(url: string): Promise<THREE.Group> {
  const { ColladaLoader } = await import("three/examples/jsm/loaders/ColladaLoader.js");
  return new Promise((resolve, reject) => {
    new ColladaLoader().load(
      url,
      (collada) => {
        if (!collada) return reject(new Error("COLLADA load returned null"));
        resolve(collada.scene as unknown as THREE.Group);
      },
      undefined,
      reject
    );
  });
}

async function loadPLY(url: string): Promise<THREE.Group> {
  const { PLYLoader } = await import("three/examples/jsm/loaders/PLYLoader.js");
  return new Promise((resolve, reject) => {
    new PLYLoader().load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          side: THREE.DoubleSide,
          vertexColors: geometry.hasAttribute("color"),
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "PLY Model";
        const group = new THREE.Group();
        group.add(mesh);
        resolve(group);
      },
      undefined,
      reject
    );
  });
}

async function loadTDS(url: string): Promise<THREE.Group> {
  const { TDSLoader } = await import("three/examples/jsm/loaders/TDSLoader.js");
  return new Promise((resolve, reject) => {
    new TDSLoader().load(url, (group) => resolve(group), undefined, reject);
  });
}

/** Dispatch to the correct Three.js loader by format */
async function loadWithThreeLoader(url: string, format: string): Promise<THREE.Group> {
  switch (format) {
    case "glb":
    case "gltf":
      return loadGLTF(url);
    case "fbx":
      return loadFBX(url);
    case "obj":
      return loadOBJ(url);
    case "stl":
      return loadSTL(url);
    case "dae":
      return loadCollada(url);
    case "ply":
      return loadPLY(url);
    case "3ds":
      return loadTDS(url);
    default:
      throw new Error(`未対応フォーマット: .${format}`);
  }
}

/** Build tree nodes recursively from an Object3D hierarchy */
function buildTreeFromObject3D(obj: THREE.Object3D): TreeNode[] {
  const nodes: TreeNode[] = [];

  function walk(o: THREE.Object3D): TreeNode | null {
    const children: TreeNode[] = [];
    for (const child of o.children) {
      const node = walk(child);
      if (node) children.push(node);
    }
    // Include if it's a Mesh or has relevant children
    if (o instanceof THREE.Mesh || children.length > 0) {
      return {
        id: o.id,
        name: o.name || `${o.type} ${o.id}`,
        type: o.type,
        children,
      };
    }
    return null;
  }

  for (const child of obj.children) {
    const node = walk(child);
    if (node) nodes.push(node);
  }
  return nodes;
}

// ── Main component ──

export function ModelViewer({ fileUrl, fileName, onModelLoaded, onElementSelected }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const treeNodesRef = useRef<TreeNode[]>([]);
  const animatingRef = useRef(false);
  const initedRef = useRef(false);
  const onModelLoadedRef = useRef(onModelLoaded);
  onModelLoadedRef.current = onModelLoaded;
  const onElementSelectedRef = useRef(onElementSelected);
  onElementSelectedRef.current = onElementSelected;

  const [status, setStatus] = useState<string>("初期化中...");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const lastSelectedRef = useRef<THREE.Mesh | null>(null);
  const lastMaterialRef = useRef<THREE.Material | THREE.Material[] | null>(null);

  const fitCameraToModel = useCallback(() => {
    const modelGroup = modelGroupRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!modelGroup || !camera || !controls || modelGroup.children.length === 0) return;

    const bbox = new THREE.Box3().setFromObject(modelGroup);
    if (bbox.isEmpty()) return;
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 1.5;
    camera.position.set(center.x + dist, center.y + dist * 0.7, center.z + dist);
    camera.near = Math.max(0.01, dist * 0.001);
    camera.far = dist * 100;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
    console.log("[ModelViewer] fitCamera: center=", center, "dist=", dist);
  }, []);

  // ── IFC loading (web-ifc) ──
  async function loadIFCData(
    data: Uint8Array,
    modelGroup: THREE.Group,
    treeNodes: TreeNode[]
  ) {
    setStatus("WASMエンジン初期化中...");
    const ifcApi = new WebIFC.IfcAPI();
    ifcApi.SetWasmPath("https://unpkg.com/web-ifc@0.0.77/", true);
    await ifcApi.Init();

    setStatus("IFCモデル解析中...");
    const modelID = ifcApi.OpenModel(data);
    let meshCount = 0;

    ifcApi.StreamAllMeshes(modelID, (mesh) => {
      const placed = mesh.geometries;
      for (let i = 0; i < placed.size(); i++) {
        const pg = placed.get(i);
        const geo = ifcApi.GetGeometry(modelID, pg.geometryExpressID);
        const verts = ifcApi.GetVertexArray(geo.GetVertexData(), geo.GetVertexDataSize());
        const indices = ifcApi.GetIndexArray(geo.GetIndexData(), geo.GetIndexDataSize());

        if (verts.length === 0 || indices.length === 0) { geo.delete(); continue; }

        const vertCount = verts.length / 6;
        const positions = new Float32Array(vertCount * 3);
        const normals = new Float32Array(vertCount * 3);
        for (let v = 0; v < vertCount; v++) {
          const s = v * 6, d = v * 3;
          positions[d] = verts[s]; positions[d + 1] = verts[s + 1]; positions[d + 2] = verts[s + 2];
          normals[d] = verts[s + 3]; normals[d + 1] = verts[s + 4]; normals[d + 2] = verts[s + 5];
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const c = pg.color;
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(c.x, c.y, c.z),
          transparent: c.w < 1,
          opacity: c.w,
          side: THREE.DoubleSide,
        });

        const m = new THREE.Mesh(geometry, material);
        const mat4 = new THREE.Matrix4();
        mat4.fromArray(pg.flatTransformation);
        m.applyMatrix4(mat4);
        m.userData.expressId = mesh.expressID;
        m.name = `IFC_${mesh.expressID}`;
        modelGroup.add(m);
        meshCount++;
        geo.delete();
      }
    });

    console.log("[ModelViewer] IFC meshes:", meshCount);
    setStatus(`ツリー構築中... (${meshCount}メッシュ)`);

    // Build flat tree for IFC
    treeNodes.length = 0;
    modelGroup.children.forEach((child) => {
      treeNodes.push({
        id: child.userData.expressId ?? child.id,
        name: child.name || `Object ${child.id}`,
        type: "Mesh",
        children: [],
      });
    });

    // Enrich with IFC type info
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
            const eid = ids.get(i);
            const props = ifcApi.GetLine(modelID, eid);
            const typeName = props?.constructor?.name || "Unknown";
            modelGroup.children.forEach((child) => {
              if (child.userData.expressId === eid) {
                child.userData.ifcType = typeName;
                child.name = props?.Name?.value || child.name;
              }
            });
          }
        } catch { /* type may not exist */ }
      }
    } catch (e) {
      console.warn("[ModelViewer] IFC type enrichment failed:", e);
    }

    ifcApi.CloseModel(modelID);
  }

  // ── Generic model loading (Three.js loaders) ──
  async function loadGenericModel(
    url: string,
    format: string,
    modelGroup: THREE.Group,
    treeNodes: TreeNode[]
  ) {
    setStatus(`${format.toUpperCase()} ファイル読込中...`);
    const result = await loadWithThreeLoader(url, format);
    modelGroup.add(result);

    treeNodes.length = 0;
    const nodes = buildTreeFromObject3D(modelGroup);
    treeNodes.push(...nodes);

    console.log("[ModelViewer] Loaded", format, "meshes:", countMeshes(modelGroup));
  }

  // ── Load dispatcher ──
  async function loadFromUrl(
    url: string,
    format: string,
    modelGroup: THREE.Group,
    treeNodes: TreeNode[]
  ) {
    if (format === "ifc") {
      setStatus("IFCファイル取得中...");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      await loadIFCData(new Uint8Array(buf), modelGroup, treeNodes);
    } else {
      await loadGenericModel(url, format, modelGroup, treeNodes);
    }
  }

  async function loadFromFile(
    file: File,
    modelGroup: THREE.Group,
    treeNodes: TreeNode[]
  ) {
    const format = getFormatFromFileName(file.name);
    if (format === "ifc") {
      setStatus("IFCファイル読込中...");
      const buf = await file.arrayBuffer();
      await loadIFCData(new Uint8Array(buf), modelGroup, treeNodes);
    } else {
      const blobUrl = URL.createObjectURL(file);
      try {
        await loadGenericModel(blobUrl, format, modelGroup, treeNodes);
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    }
  }

  // ── Main effect ──
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || initedRef.current) return;
    initedRef.current = true;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      // Camera
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
      camera.position.set(20, 20, 20);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controlsRef.current = controls;

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dl1 = new THREE.DirectionalLight(0xffffff, 0.8);
      dl1.position.set(50, 100, 50);
      scene.add(dl1);
      const dl2 = new THREE.DirectionalLight(0xffffff, 0.3);
      dl2.position.set(-50, 50, -50);
      scene.add(dl2);

      // Grid
      scene.add(new THREE.GridHelper(100, 100, 0x444444, 0x333333));

      // Model group
      const modelGroup = new THREE.Group();
      scene.add(modelGroup);
      modelGroupRef.current = modelGroup;

      // Animation loop
      animatingRef.current = true;
      (function animate() {
        if (!animatingRef.current) return;
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      })();

      // Resize
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        }
      });
      resizeObserver.observe(container);

      // Click selection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      canvas.addEventListener("click", (event: MouseEvent) => {
        if (lastSelectedRef.current && lastMaterialRef.current) {
          lastSelectedRef.current.material = lastMaterialRef.current;
          lastSelectedRef.current = null;
          lastMaterialRef.current = null;
        }

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(modelGroup, true);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          if (hit.material) {
            lastSelectedRef.current = hit;
            lastMaterialRef.current = hit.material;
            hit.material = new THREE.MeshStandardMaterial({
              color: 0x00aaff, transparent: true, opacity: 0.8,
            });
          }

          const props: PropertyGroup[] = [
            {
              groupName: "基本情報",
              properties: [
                { name: "名前", value: hit.name || "不明" },
                { name: "タイプ", value: hit.userData.ifcType || hit.type },
                { name: "ID", value: String(hit.userData.expressId ?? hit.id) },
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
          const sz = box.getSize(new THREE.Vector3());
          props.push({
            groupName: "サイズ",
            properties: [
              { name: "幅 (X)", value: `${sz.x.toFixed(3)} m` },
              { name: "高さ (Y)", value: `${sz.y.toFixed(3)} m` },
              { name: "奥行 (Z)", value: `${sz.z.toFixed(3)} m` },
            ],
          });

          onElementSelectedRef.current(hit.userData.expressId ?? hit.id, props);
        } else {
          onElementSelectedRef.current(null, []);
        }
      });

      setStatus("3Dシーン準備完了");

      // Build viewer API
      function createApi(): ViewerApi {
        return {
          getTree: () => [...treeNodesRef.current],
          selectElement: (id: number) => {
            // Restore previous selection
            if (lastSelectedRef.current && lastMaterialRef.current) {
              lastSelectedRef.current.material = lastMaterialRef.current;
              lastSelectedRef.current = null;
              lastMaterialRef.current = null;
            }

            let found = false;
            modelGroup.traverse((child) => {
              if (found) return;
              const match = child.userData.expressId === id || child.id === id;
              if (!match) return;
              found = true;

              // Move camera (works for both Mesh and Group)
              const box = new THREE.Box3().setFromObject(child);
              if (box.isEmpty()) return;
              const center = box.getCenter(new THREE.Vector3());
              const sz = box.getSize(new THREE.Vector3());
              const dist = Math.max(sz.x, sz.y, sz.z, 1) * 2.5;
              camera.position.set(center.x + dist * 0.7, center.y + dist * 0.5, center.z + dist * 0.7);
              controls.target.copy(center);
              controls.update();

              // Highlight (Mesh only)
              if (child instanceof THREE.Mesh) {
                lastSelectedRef.current = child;
                lastMaterialRef.current = child.material;
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x00aaff, transparent: true, opacity: 0.8,
                });
              }

              // Build properties
              const childCount = child instanceof THREE.Mesh ? undefined
                : child.children.length;
              const props: PropertyGroup[] = [
                {
                  groupName: "基本情報",
                  properties: [
                    { name: "名前", value: child.name || "不明" },
                    { name: "タイプ", value: child.userData.ifcType || child.type },
                    { name: "ID", value: String(child.userData.expressId ?? child.id) },
                    ...(childCount !== undefined
                      ? [{ name: "子要素数", value: String(childCount) }]
                      : []),
                  ],
                },
                {
                  groupName: "ジオメトリ",
                  properties: [
                    { name: "位置", value: `(${child.position.x.toFixed(2)}, ${child.position.y.toFixed(2)}, ${child.position.z.toFixed(2)})` },
                  ],
                },
                {
                  groupName: "サイズ",
                  properties: [
                    { name: "幅 (X)", value: `${sz.x.toFixed(3)} m` },
                    { name: "高さ (Y)", value: `${sz.y.toFixed(3)} m` },
                    { name: "奥行 (Z)", value: `${sz.z.toFixed(3)} m` },
                  ],
                },
              ];
              onElementSelectedRef.current(child.userData.expressId ?? child.id, props);
            });
          },
          fitView: fitCameraToModel,
          setViewAngle: (angle: "front" | "top" | "right") => {
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
          },
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
      }

      // Load from URL
      if (fileUrl) {
        const format = getFormatFromFileName(fileName);
        loadFromUrl(fileUrl, format, modelGroup, treeNodesRef.current)
          .then(() => {
            fitCameraToModel();
            setStatus("");
            setLoaded(true);
            onModelLoadedRef.current(createApi());
          })
          .catch((err) => {
            console.error("[ModelViewer] Load error:", err);
            setError(`読込エラー: ${err.message}`);
            setStatus("");
          });
      } else {
        // Local test mode — drag & drop / file picker
        setStatus("");
        onModelLoadedRef.current({ ...createApi(), getTree: () => [] });

        container.addEventListener("dragover", (e) => e.preventDefault());
        container.addEventListener("drop", (e: DragEvent) => {
          e.preventDefault();
          const file = e.dataTransfer?.files[0];
          if (file && isSupportedFormat(file.name)) {
            setError(null);
            loadFromFile(file, modelGroup, treeNodesRef.current)
              .then(() => {
                fitCameraToModel();
                setStatus("");
                setLoaded(true);
                onModelLoadedRef.current(createApi());
              })
              .catch((err) => {
                setError(`読込エラー: ${err.message}`);
                setStatus("");
              });
          } else if (file) {
            setError(`未対応のファイル形式です: ${file.name}`);
          }
        });
        container.addEventListener("localFileSelected", ((e: CustomEvent) => {
          const file = e.detail as File;
          setError(null);
          loadFromFile(file, modelGroup, treeNodesRef.current)
            .then(() => {
              fitCameraToModel();
              setStatus("");
              setLoaded(true);
              onModelLoadedRef.current(createApi());
            })
            .catch((err) => {
              setError(`読込エラー: ${err.message}`);
              setStatus("");
            });
        }) as EventListener);
      }

    return () => {
      initedRef.current = false;
      animatingRef.current = false;
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      modelGroupRef.current = null;
    };
  }, [fileUrl, fileName, fitCameraToModel]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
      {status && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-gray-800/90 text-white px-6 py-4 rounded-xl text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full mb-2" />
            <p className="text-sm">{status}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-red-900/90 text-white px-6 py-4 rounded-xl text-center max-w-md">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      {!fileUrl && !status && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-gray-800/80 text-white px-6 py-4 rounded-xl text-center pointer-events-auto">
            <p className="text-lg font-medium mb-2">3Dモデルビューア</p>
            <p className="text-sm text-gray-300 mb-3">
              3Dファイルをドラッグ&ドロップして読み込みます
            </p>
            <p className="text-xs text-gray-400 mb-3">
              対応形式: IFC, glTF/GLB, FBX, OBJ, STL, COLLADA, PLY, 3DS
            </p>
            <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer text-sm">
              ファイルを選択
              <input
                type="file"
                accept={ACCEPT_STRING}
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

function countMeshes(obj: THREE.Object3D): number {
  let n = 0;
  obj.traverse((c) => { if (c instanceof THREE.Mesh) n++; });
  return n;
}
