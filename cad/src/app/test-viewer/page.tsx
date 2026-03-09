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

export default function TestViewerPage() {
  return (
    <ViewerClient
      fileId="local-test"
      fileName="ローカルIFCテスト"
      fileUrl={null}
    />
  );
}
