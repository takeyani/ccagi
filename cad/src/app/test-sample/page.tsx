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

export default function TestSamplePage() {
  return (
    <ViewerClient
      fileId="test-sample"
      fileName="6_Kiki_hanso.ifc (サンプル)"
      fileUrl="/samples/sample.ifc"
    />
  );
}
