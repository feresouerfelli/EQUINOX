"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Star, Users, CheckCircle, Clock, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { FilterChips } from "@/components/dashboard/Widgets";

export default function AdminCoursesPage() {
  const t = useTranslations("admin.courses");
  const tc = useTranslations("common");
  const token = useAuthStore((s) => s.token);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCourses = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await api.get<any>(`/admin/courses/all?${params}`, token);
      setCourses(data.data || []);
      setTotal(data.total || 0);
    } catch {}
  };

  useEffect(() => { fetchCourses(); }, [page, statusFilter, token]);

  const filters = [
    { key: "all", label: t("all") },
    { key: "active", label: t("active") },
    { key: "pending", label: t("pending") },
    { key: "draft", label: t("draft") },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="badge-green">{t("active")}</span>;
      case "pending": return <span className="badge-gold-dark">{t("pending")}</span>;
      case "draft": return <span className="badge-grey">{t("draft")}</span>;
      default: return <span className="badge-grey">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D7A60]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchCourses())} placeholder={t("searchPlaceholder")} className="input-dark !pl-10" />
        </div>
        <FilterChips options={filters} selected={statusFilter} onSelect={(k) => { setStatusFilter(k); setPage(1); }} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, i) => (
          <div key={course.id || i} className="dash-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A6B4A]/20 text-lg">
                <BookOpen size={20} className="text-[#34D399]" />
              </div>
              {statusBadge(course.status)}
            </div>
            <h3 className="mt-3 font-semibold text-[#E8F5E0]">{course.title_fr || course.title_ar}</h3>
            <p className="mt-1 text-xs text-[#4D7A60]">{course.professor?.user?.name || "—"}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-[#9DBFAA]">
              <span className="flex items-center gap-1"><Users size={12} /> {course.enrollments_count ?? 0}</span>
              <span className="flex items-center gap-1"><Star size={12} className="text-[#C9A84C]" /> {course.rating || "0"}</span>
              <span>{course.price_dt} DT</span>
            </div>
            {course.status === "pending" && (
              <button className="mt-3 btn-primary !w-full !py-2 !text-xs">
                <CheckCircle size={14} /> {t("approve")}
              </button>
            )}
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-[#4D7A60]">{t("noCourses")}</div>
        )}
      </div>
    </div>
  );
}
