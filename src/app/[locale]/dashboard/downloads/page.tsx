"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, FileText, Video, Image, CheckCircle, Loader2 } from "lucide-react";

const resources = [
  { name: "ملخص التحليل الرياضي - الفصول 1-5", type: "PDF", size: "3.2 MB", date: "2026-06-20", icon: FileText },
  { name: "محاضرة هياكل البيانات", type: "Video", size: "245 MB", date: "2026-06-18", icon: Video },
  { name: "شرح SQL مع أمثلة", type: "PDF", size: "1.8 MB", date: "2026-06-15", icon: FileText },
  { name: "صور الشبكات", type: "Images", size: "12 MB", date: "2026-06-10", icon: Image },
  { name: "امتحانات سابقة 2024", type: "PDF", size: "5.2 MB", date: "2026-06-08", icon: FileText },
  { name: "محاضرة قانون الأعمال", type: "Video", size: "180 MB", date: "2026-06-05", icon: Video },
];

export default function StudentDownloadsPage() {
  const t = useTranslations("student.downloads");
  const [downloading, setDownloading] = useState<Record<number, "idle" | "loading" | "done">>({});

  const handleDownload = (index: number) => {
    setDownloading((prev) => ({ ...prev, [index]: "loading" }));
    setTimeout(() => {
      const content = `${resources[index].name}\nالنوع: ${resources[index].type}\nالحجم: ${resources[index].size}\n\n(ملف تجريبي - EQUINOX)`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${resources[index].name}.txt`; a.click();
      URL.revokeObjectURL(url);
      setDownloading((prev) => ({ ...prev, [index]: "done" }));
      setTimeout(() => setDownloading((prev) => ({ ...prev, [index]: "idle" })), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
      <div className="space-y-2">
        {resources.map((r, i) => {
          const state = downloading[i] || "idle";
          const Icon = r.icon;
          return (
            <div key={i} className="dash-card-flat flex items-center justify-between fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A6B4A]/10">
                  <Icon size={18} className="text-[#34D399]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#E8F5E0]">{r.name}</p>
                  <p className="text-[10px] text-[#4D7A60]">{r.type} · {r.size} · {r.date}</p>
                </div>
              </div>
              <button onClick={() => handleDownload(i)} disabled={state === "loading"}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                  state === "done" ? "bg-[#34D399]/20 text-[#34D399]"
                    : state === "loading" ? "bg-[rgba(255,255,255,0.05)] text-[#4D7A60]"
                    : "bg-[#0A6B4A]/20 text-[#34D399] hover:bg-[#0A6B4A]/30"
                }`}>
                {state === "loading" ? <Loader2 size={14} className="animate-spin" />
                  : state === "done" ? <CheckCircle size={14} />
                  : <Download size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
