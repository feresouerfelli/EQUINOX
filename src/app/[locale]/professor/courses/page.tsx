"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Star, Users, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { FilterChips } from "@/components/dashboard/Widgets";

export default function ProfessorCoursesPage() {
  const t = useTranslations("professor.courses");
  const token = useAuthStore((s) => s.token);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    api.get<any>("/professor/courses", token)
      .then((data) => setCourses(data.data || []))
      .catch(() => {});
  }, [token]);

  const filtered = courses.filter((c) => {
    if (search && !c.title_fr?.toLowerCase().includes(search.toLowerCase()) && !c.title_ar?.includes(search)) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const statusBadge = (s: string) => {
    switch (s) {
      case "active": return <span className="badge-green">{t("active")}</span>;
      case "pending": return <span className="badge-gold-dark">انتظار</span>;
      case "draft": return <span className="badge-grey">{t("draft")}</span>;
      default: return <span className="badge-grey">{s}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D7A60]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="input-dark !pl-10" />
        </div>
        <FilterChips
          options={[{ key: "all", label: t("all") }, { key: "active", label: t("active") }, { key: "draft", label: t("draft") }]}
          selected={statusFilter} onSelect={setStatusFilter}
        />
        <button className="btn-primary !py-2 !text-xs"><Plus size={14} /> {t("newCourse")}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course, i) => (
          <div key={course.id || i} className="dash-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A6B4A]/20 text-lg">
                <BookOpen size={20} className="text-[#34D399]" />
              </div>
              {statusBadge(course.status)}
            </div>
            <h3 className="mt-3 font-semibold text-[#E8F5E0]">{course.title_fr || course.title_ar}</h3>
            <div className="mt-3 flex items-center gap-4 text-xs text-[#9DBFAA]">
              <span className="flex items-center gap-1"><Users size={12} /> {course.enrollments_count ?? 0}</span>
              <span className="flex items-center gap-1"><Star size={12} className="text-[#C9A84C]" /> {course.rating || "0"}</span>
              <span>{course.price_dt} DT</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
