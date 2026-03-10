export const SUPPORTED_3D_FORMATS = [
  { ext: "ifc", label: "IFC (Industry Foundation Classes)" },
  { ext: "glb", label: "glTF Binary" },
  { ext: "gltf", label: "glTF" },
  { ext: "fbx", label: "Autodesk FBX" },
  { ext: "obj", label: "Wavefront OBJ" },
  { ext: "stl", label: "STL (3Dプリント)" },
  { ext: "dae", label: "COLLADA" },
  { ext: "ply", label: "PLY (Point Cloud)" },
  { ext: "3ds", label: "3D Studio" },
] as const;

export const SUPPORTED_EXTENSIONS = SUPPORTED_3D_FORMATS.map((f) => f.ext);

export const ACCEPT_STRING = SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(",");

export function getFormatFromFileName(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function isSupportedFormat(fileName: string): boolean {
  const ext = getFormatFromFileName(fileName);
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}
