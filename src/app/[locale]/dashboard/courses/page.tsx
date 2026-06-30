"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, BookOpen, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "@/i18n/navigation";

export default function StudentCoursesPage() {
  const t = useTranslations("common");
  const td = useTranslations("dashboard");
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    api.get<any>("/student/courses", token).then(setCourses).catch(() => {});
  }, [token]);

  const filtered = courses.filter((c) => {
    const course = c.course;
    return !search || course?.title_fr?.toLowerCase().includes(search.toLowerCase()) || course?.title_ar?.includes(search);
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D7A60]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`${t("search")}...`} className="input-dark !pl-10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((enrollment, i) => {
          const course = enrollment.course;
          return (
            <div key={i} className="dash-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A6B4A]/20">
                  <BookOpen size={20} className="text-[#34D399]" />
                </div>
                <span className="badge-green">{enrollment.progress_percent || 0}%</span>
              </div>
              <h3 className="mt-3 font-semibold text-[#E8F5E0]">{course?.title_fr || course?.title_ar}</h3>
              <p className="text-xs text-[#4D7A60]">{course?.professor?.user?.name}</p>
              <div className="mt-3 h-2 rounded-full bg-[rgba(255,255,255,0.07)]">
                <div className="h-full rounded-full bg-[#0A6B4A] transition-all" style={{ width: `${enrollment.progress_percent || 0}%` }} />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-[#4D7A60]">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p>{td("noCourses")}</p>
            <button onClick={() => router.push("/courses")} className="btn-primary mt-4 !py-2 !text-xs">{td("browseCourses")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
