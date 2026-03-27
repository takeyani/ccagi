"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm sm:prose max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-8 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-6 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mt-4 mb-2">{children}</h4>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-200 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-3 py-2">{children}</td>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-4">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-8 border-gray-200" />,
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-2 space-y-1">{children}</ol>
          ),
          p: ({ children }) => <p className="my-2 leading-7">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-300 pl-4 my-4 text-gray-600 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
