"use client";

import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function ProfessorStudentsPage() {
  const t = useTranslations("professor.students");
  const token = useAuthStore((s) => s.token);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    api.get<any>("/professor/students", token)
      .then((data) => setStudents(data.data || []))
      .catch(() => {});
  }, [token]);

  const filtered = students.filter((s) =>
    !search || s.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D7A60]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="input-dark !pl-10" />
        </div>
        <button className="btn-ghost !py-2 !text-xs"><Download size={14} /> {t("export")}</button>
      </div>

      <div className="dash-card-flat fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("student")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("subject")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("progress")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("lastActivity")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
              {filtered.map((s, i) => (
                <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A6B4A] text-xs font-bold text-[#E8F5E0]">
                        {s.user?.name?.[0] || "T"}
                      </div>
                      <span className="text-[#E8F5E0]">{s.user?.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#9DBFAA]">{s.course?.title_fr || s.course?.title_ar || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-[rgba(255,255,255,0.07)]">
                        <div className="h-full rounded-full bg-[#0A6B4A]" style={{ width: `${s.progress_percent || 0}%` }} />
                      </div>
                      <span className="text-xs text-[#4D7A60]">{s.progress_percent || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9DBFAA]">{s.updated_at ? new Date(s.updated_at).toLocaleDateString("fr-TN") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={s.progress_percent >= 80 ? "badge-green" : s.progress_percent >= 40 ? "badge-gold-dark" : "badge-grey"}>
                      {s.progress_percent >= 80 ? t("excellent") : s.progress_percent >= 40 ? t("average") : t("new")}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#4D7A60]">{t("noStudents")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
