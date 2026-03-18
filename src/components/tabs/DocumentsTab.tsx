"use client";

import { useState, type ReactNode } from "react";
import { portalDocuments, type PortalDocument } from "@/lib/documents";

export function DocumentsTab() {
  const [openDocId, setOpenDocId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">資料ライブラリ</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {portalDocuments.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setOpenDocId(doc.id)}
            className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md hover:border-orange-200 transition-all text-left group"
          >
            <div className="text-3xl mb-3">{doc.icon}</div>
            <h3 className="font-bold text-stone-800 group-hover:text-orange-700 transition-colors">
              {doc.title}
            </h3>
            <p className="text-sm text-stone-500 mt-1">{doc.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-stone-400">
                {doc.sections.length}セクション
              </span>
              <span className="text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                開く →
              </span>
            </div>
          </button>
        ))}
      </div>

      {openDocId && (
        <DocumentViewer
          doc={portalDocuments.find((d) => d.id === openDocId)!}
          onClose={() => setOpenDocId(null)}
        />
      )}
    </div>
  );
}

function DocumentViewer({ doc, onClose }: { doc: PortalDocument; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(0);
  const section = doc.sections[activeSection];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 mx-4 border border-stone-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{doc.icon}</span>
            <h2 className="font-bold text-stone-800 text-lg">{doc.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-stone-200 px-6 overflow-x-auto shrink-0">
          <div className="flex gap-1">
            {doc.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === i
                    ? "border-orange-500 text-orange-700"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <MarkdownRenderer content={section.content} />
        </div>
      </div>
    </div>
  );
}

// ─── Markdown Renderer ───

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++} className="text-base font-bold text-stone-800 mt-5 mb-2">{renderInline(line.slice(4))}</h3>);
      i++; continue;
    }

    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="border-stone-200 my-5" />);
      i++; continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1]?.includes("---")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) { tableLines.push(lines[i]); i++; }
      elements.push(<MdTable key={key++} lines={tableLines} />);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const ql: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { ql.push(lines[i].slice(2)); i++; }
      elements.push(
        <blockquote key={key++} className="border-l-4 border-orange-300 pl-4 py-2 my-3 bg-orange-50 rounded-r-lg text-stone-600 italic text-sm">
          {ql.map((l, j) => <p key={j} className="mb-1 last:mb-0">{renderInline(l)}</p>)}
        </blockquote>
      );
      continue;
    }

    // List
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) { items.push(lines[i].slice(2)); i++; }
      elements.push(
        <ul key={key++} className="space-y-1 my-2">{items.map((it, j) => (
          <li key={j} className="flex items-start gap-2 text-sm text-stone-600">
            <span className="text-orange-500 mt-0.5">-</span>
            <span>{renderInline(it)}</span>
          </li>
        ))}</ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++; }
      elements.push(
        <ol key={key++} className="space-y-1 my-2">{items.map((it, j) => (
          <li key={j} className="flex items-start gap-2 text-sm text-stone-600">
            <span className="text-orange-600 font-medium shrink-0">{j + 1}.</span>
            <span>{renderInline(it)}</span>
          </li>
        ))}</ol>
      );
      continue;
    }

    // Arrow line
    if (line.startsWith("→ ")) {
      elements.push(<p key={key++} className="text-sm text-orange-700 font-medium bg-orange-50 px-3 py-2 rounded-lg my-2">→ {renderInline(line.slice(2))}</p>);
      i++; continue;
    }

    if (line.trim() === "") { i++; continue; }

    elements.push(<p key={key++} className="text-sm text-stone-600 my-2">{renderInline(line)}</p>);
    i++;
  }

  return <>{elements}</>;
}

function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-bold text-stone-800">{part.slice(2, -2)}</strong>
      : part
  );
}

function MdTable({ lines }: { lines: string[] }) {
  if (lines.length < 2) return null;
  const parse = (l: string) => l.split("|").map((c) => c.trim()).filter(Boolean);
  const headers = parse(lines[0]);
  const rows = lines.slice(2).map(parse);
  return (
    <div className="overflow-x-auto my-3 rounded-lg border border-stone-200">
      <table className="w-full text-sm">
        <thead><tr className="bg-stone-50">
          {headers.map((h, i) => <th key={i} className="text-left px-3 py-2 font-medium text-stone-700 border-b border-stone-200">{renderInline(h)}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((row, ri) => <tr key={ri} className="border-b border-stone-100 last:border-0">
            {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-stone-600">{renderInline(cell)}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}
