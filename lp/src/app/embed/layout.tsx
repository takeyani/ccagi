import type { Metadata } from "next";
import { EmbedProvider } from "@/lib/embed-context";
import "../globals.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head />
      <body style={{ margin: 0, background: "transparent" }}>
        <EmbedProvider>
          {children}
        </EmbedProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var lastHeight = 0;
  function reportHeight() {
    var h = document.documentElement.scrollHeight;
    if (h !== lastHeight) {
      lastHeight = h;
      window.parent.postMessage({ type: 'ccagi-embed-resize', height: h }, '*');
    }
  }
  reportHeight();
  var observer = new MutationObserver(reportHeight);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  setInterval(reportHeight, 1000);
  window.addEventListener('load', reportHeight);
})();
`,
          }}
        />
      </body>
    </html>
  );
}
