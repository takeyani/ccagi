"use client";

import { CreatorGate } from "@/components/creator-lp/CreatorGate";
import { CreatorSidebar } from "@/components/creator-lp/CreatorSidebar";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CreatorGate>
      {(affiliate) => (
        <div className="flex min-h-screen">
          <CreatorSidebar affiliate={affiliate} />
          <main className="flex-1 bg-gray-50 p-8">{children}</main>
        </div>
      )}
    </CreatorGate>
  );
}
