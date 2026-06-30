"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { KPICard, BarChart } from "@/components/dashboard/Widgets";

export default function ProfessorAnalyticsPage() {
  const t = useTranslations("professor.analytics");
  const token = useAuthStore((s) => s.token);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    api.get<any>("/professor/analytics", token).then(setAnalytics).catch(() => {});
  }, [token]);

  const kpis = [
    { label: t("totalRevenue"), value: analytics?.kpis?.total_revenue ?? 0, icon: DollarSign, color: "bg-[#C9A84C]/20 text-[#C9A84C]", suffix: " DT" },
    { label: t("totalStudents"), value: analytics?.kpis?.total_students ?? 0, icon: Users, color: "bg-[#0A6B4A]/20 text-[#34D399]" },
    { label: t("avgProgress"), value: analytics?.kpis?.avg_completion ?? 0, icon: TrendingUp, color: "bg-purple-500/20 text-purple-400]", suffix: "%" },
    { label: t("activeSubjects"), value: analytics?.kpis?.active_courses ?? 0, icon: BarChart3, color: "bg-blue-500/20 text-blue-400" },
  ];

  const revenueData = (analytics?.monthly_revenue || []).map((m: any) => ({
    label: m.month, value: m.amount, color: "bg-[#C9A84C]",
  }));

  const coursesData = (analytics?.courses || []).map((c: any) => ({
    label: c.name?.substring(0, 8), value: c.students, color: "bg-[#0A6B4A]",
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => <KPICard key={i} {...kpi} delay={i * 100} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart data={revenueData.length ? revenueData : [{ label: t("noData"), value: 0 }]} delay={400} />
        <BarChart data={coursesData.length ? coursesData : [{ label: t("noData"), value: 0 }]} delay={500} />
      </div>

      <div className="dash-card-flat fade-up stagger-6">
        <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("performance")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("subject")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("students")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("rating")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("level")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
              {(analytics?.courses || []).map((c: any, i: number) => (
                <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-4 py-3 text-[#E8F5E0]">{c.name}</td>
                  <td className="px-4 py-3 text-[#9DBFAA]">{c.students}</td>
                  <td className="px-4 py-3 text-[#C9A84C]">{c.rating}</td>
                  <td className="px-4 py-3 text-[#9DBFAA]">{c.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
