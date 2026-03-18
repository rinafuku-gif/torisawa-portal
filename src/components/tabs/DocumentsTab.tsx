"use client";

import { driveDocuments } from "@/lib/data";

export function DocumentsTab() {
  const categories = [...new Set(driveDocuments.map((d) => d.category))];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">資料ライブラリ</h2>
      <p className="text-sm text-stone-500">
        Google Driveに保存されている資料へのリンク集です。クリックで開きます。
      </p>

      {categories.map((cat) => {
        const docs = driveDocuments.filter((d) => d.category === cat);
        return (
          <div key={cat}>
            <h3 className="text-sm font-bold text-stone-700 mb-3">{cat}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {docs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.driveId ? `https://docs.google.com/document/d/${doc.driveId}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md hover:border-orange-200 transition-all text-left group block"
                >
                  <div className="text-3xl mb-3">{doc.icon}</div>
                  <h4 className="font-bold text-stone-800 group-hover:text-orange-700 transition-colors">
                    {doc.title}
                  </h4>
                  <p className="text-sm text-stone-500 mt-1">{doc.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-stone-400">{doc.category}</span>
                    <span className="text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      開く →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {/* Drive Folder Link */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 text-center">
        <p className="text-sm text-stone-600">
          全資料フォルダ:
          <a
            href="https://drive.google.com/drive/folders/1YS9lWdRY7QaiHOn_xfdq8sc2GW0bwoaq"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 font-medium ml-1 hover:underline"
          >
            マイドライブ/20_となりにとまる/01_鳥沢物件
          </a>
        </p>
      </div>
    </div>
  );
}
