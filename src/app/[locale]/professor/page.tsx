"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, DollarSign, TrendingUp, Video, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { KPICard, BarChart } from "@/components/dashboard/Widgets";

export default function ProfessorHomePage() {
  const t = useTranslations("professor.home");
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    api.get<any>("/professor/stats", token).then(setStats).catch(() => {});
  }, [token]);

  const kpis = [
    { label: t("totalStudents"), value: stats?.total_students ?? 0, icon: Users, color: "bg-[#0A6B4A]/20 text-[#34D399]" },
    { label: t("revenue"), value: stats?.revenue ?? 0, icon: DollarSign, color: "bg-[#C9A84C]/20 text-[#C9A84C]", suffix: " DT" },
    { label: t("activeCourses"), value: stats?.active_courses ?? 0, icon: BookOpen, color: "bg-blue-500/20 text-blue-400" },
    { label: t("upcomingSessions"), value: stats?.upcoming_sessions ?? 0, icon: Video, color: "bg-purple-500/20 text-purple-400" },
  ];

  const weekDays = [t("day.sunday"), t("day.monday"), t("day.tuesday"), t("day.wednesday"), t("day.thursday"), t("day.friday"), t("day.saturday")];
  const activityData = weekDays.map((d) => ({ label: d, value: Math.floor(Math.random() * 50) + 10 }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-gradient-to-l from-[#0A6B4A]/20 to-[#142918] p-6 fade-up">
        <h2 className="text-xl font-bold text-[#E8F5E0]">{t("welcomeSubtitle")}</h2>
        <p className="mt-1 text-sm text-[#9DBFAA]">{t("welcomeDesc")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => <KPICard key={i} {...kpi} delay={i * 100} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart data={activityData} delay={400} />
        <div className="dash-card-flat fade-up stagger-5">
          <h3 className="mb-3 text-sm font-semibold text-[#E8F5E0]">{t("upcomingTitle")}</h3>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3">
                <div>
                  <p className="text-sm text-[#E8F5E0]">{t("session")} #{i}</p>
                  <p className="text-xs text-[#4D7A60]">{t("today")} {14 + i}:00</p>
                </div>
                <span className="badge-green">مجدولة</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
