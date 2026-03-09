"use client";

import dynamic from "next/dynamic";

const ViewerClient = dynamic(() => import("@/components/viewer/ViewerClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <p>ビューアを読み込んでいます...</p>
    </div>
  ),
});

type Props = {
  fileId: string;
  fileName: string;
  fileUrl: string | null;
};

export function ViewerLoader({ fileId, fileName, fileUrl }: Props) {
  return <ViewerClient fileId={fileId} fileName={fileName} fileUrl={fileUrl} />;
}
