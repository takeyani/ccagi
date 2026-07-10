// 画像/動画アップロード用の共通ヘルパー。XHR を使い進捗コールバックを提供し、
// 画像は Canvas API で 2000px 上限にリサイズ + 再エンコードして帯域を節約する。

const RESIZE_MAX_DIMENSION = 2000;
const RESIZE_QUALITY = 0.85;
// 画像リサイズをかけない小さめの閾値（1MB 以下 or 元寸法が小さい）
const RESIZE_SIZE_THRESHOLD = 1_000_000;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadResult = {
  url: string;
  type: "image" | "video";
  contentType: string;
};

export type UploadOptions = {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

async function shouldResize(file: File): Promise<boolean> {
  if (!IMAGE_TYPES.has(file.type)) return false;
  if (file.size < RESIZE_SIZE_THRESHOLD) return false;

  // 実寸法を測って RESIZE_MAX_DIMENSION 以下なら不要
  return new Promise<boolean>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width > RESIZE_MAX_DIMENSION || img.height > RESIZE_MAX_DIMENSION);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

/** 画像を Canvas 経由で長辺 2000px にリサイズし、JPEG で再エンコードした Blob を返す */
export async function resizeImage(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
      el.src = url;
    });

    const ratio = Math.min(
      RESIZE_MAX_DIMENSION / img.width,
      RESIZE_MAX_DIMENSION / img.height,
      1
    );
    const targetWidth = Math.round(img.width * ratio);
    const targetHeight = Math.round(img.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context を取得できませんでした");

    // 白背景で塗りつぶし（PNG の透過を JPEG 化するとき黒くならないように）
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", RESIZE_QUALITY)
    );
    if (!blob) throw new Error("画像リサイズに失敗しました");

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** XHR で FormData をアップロード。onProgress(0-100) が呼ばれる */
export function uploadWithProgress(
  file: File,
  { onProgress, signal }: UploadOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", "/api/creator/upload");
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      const body = xhr.response as { url?: string; type?: string; contentType?: string; error?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.url) {
        resolve({
          url: body.url,
          type: (body.type as "image" | "video") ?? "image",
          contentType: body.contentType ?? file.type,
        });
      } else {
        reject(new Error(body?.error || `アップロード失敗 (HTTP ${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("ネットワークエラーが発生しました"));
    xhr.onabort = () => reject(new Error("アップロードを中止しました"));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(formData);
  });
}

/** 画像の場合は必要に応じてリサイズ → アップロード。動画・GIFはそのまま */
export async function smartUpload(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const target = (await shouldResize(file)) ? await resizeImage(file) : file;
  return uploadWithProgress(target, options);
}
