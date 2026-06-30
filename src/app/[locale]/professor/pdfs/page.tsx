"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

const pdfFiles = [
  { name: "ملخص الفصل 7", course: "التحليل الرياضي", size: "2.4 MB", date: "2026-06-20", downloads: 145 },
  { name: "تمارين Binary Trees", course: "هياكل البيانات", size: "1.8 MB", date: "2026-06-18", downloads: 89 },
  { name: "SQL كامل", course: "قواعد البيانات", size: "3.1 MB", date: "2026-06-15", downloads: 210 },
  { name: "امتحانات سابقة 2024", course: "التحليل الرياضي", size: "5.2 MB", date: "2026-06-10", downloads: 320 },
  { name: "OSI Model", course: "شبكات الحاسوب", size: "1.2 MB", date: "2026-06-08", downloads: 67 },
  { name: "مقدمة AI", course: "الذكاء الاصطناعي", size: "4.5 MB", date: "2026-06-05", downloads: 178 },
];

export default function ProfessorPDFsPage() {
  const t = useTranslations("professor.pdfs");
  const [downloadState, setDownloadState] = useState<Record<number, "idle" | "loading" | "done">>({});

  const handleDownload = (index: number) => {
    setDownloadState((prev) => ({ ...prev, [index]: "loading" }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        clearInterval(interval);
        const content = `${pdfFiles[index].name}\n${t("subject")} ${pdfFiles[index].course}\n${t("size")} ${pdfFiles[index].size}\n\n${t("sampleFile")}`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pdfFiles[index].name}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloadState((prev) => ({ ...prev, [index]: "done" }));
        setTimeout(() => setDownloadState((prev) => ({ ...prev, [index]: "idle" })), 3000);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pdfFiles.map((pdf, i) => {
          const state = downloadState[i] || "idle";
          return (
            <div key={i} className="dash-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <FileText size={24} className="text-red-400" />
              </div>
              <h3 className="mt-3 font-semibold text-[#E8F5E0]">{pdf.name}</h3>
              <p className="text-xs text-[#4D7A60]">{pdf.course}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-[#4D7A60]">
                <span>{pdf.size}</span>
                <span>{pdf.date}</span>
                <span>{pdf.downloads} تحميل</span>
              </div>
              <button
                onClick={() => handleDownload(i)}
                disabled={state === "loading"}
                className={`mt-3 w-full rounded-lg py-2 text-xs font-medium transition-all ${
                  state === "done"
                    ? "bg-[#34D399]/20 text-[#34D399]"
                    : state === "loading"
                    ? "bg-[rgba(255,255,255,0.05)] text-[#4D7A60]"
                    : "bg-[#0A6B4A]/20 text-[#34D399] hover:bg-[#0A6B4A]/30"
                }`}
              >
                {state === "loading" ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 size={12} className="animate-spin" /> {t("downloading")}</span>
                ) : state === "done" ? (
                  <span className="flex items-center justify-center gap-2"><CheckCircle size={12} /> {t("downloaded")}</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Download size={12} /> {t("download")}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
