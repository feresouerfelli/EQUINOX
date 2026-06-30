"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Users, DollarSign, CreditCard, Video, TrendingUp, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { KPICard, BarChart, DonutChart } from "@/components/dashboard/Widgets";

export default function AdminHomePage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    api.get<any>("/admin/stats", token).then(setStats).catch(() => {});
  }, [token]);

  const kpis = [
    { label: t("stats.totalStudents"), value: stats?.total_students ?? 0, icon: Users, color: "bg-[#0A6B4A]/20 text-[#34D399]", trend: "+15" },
    { label: t("stats.revenue"), value: stats?.revenue_mtd ?? 0, icon: DollarSign, color: "bg-[#C9A84C]/20 text-[#C9A84C]", prefix: "", suffix: " DT" },
    { label: t("stats.activeSubscriptions"), value: stats?.active_subscriptions ?? 0, icon: CreditCard, color: "bg-blue-500/20 text-blue-400" },
    { label: t("stats.liveSessions"), value: stats?.live_sessions_today ?? 0, icon: Video, color: "bg-red-500/20 text-red-400" },
  ];

  const specialtyData = [
    { label: t("specialties.media"), value: 320, color: "bg-[#0A6B4A]" },
    { label: t("specialties.medicine"), value: 280, color: "bg-[#C9A84C]" },
    { label: t("specialties.law"), value: 210, color: "bg-blue-500" },
    { label: t("specialties.economics"), value: 180, color: "bg-purple-500" },
    { label: t("specialties.engineering"), value: 150, color: "bg-orange-500" },
    { label: t("specialties.arts"), value: 120, color: "bg-pink-500" },
  ];

  const paymentData = [
    { label: "D17", value: 44, color: "#C9A84C" },
    { label: "Konnect", value: 28, color: "#3B82F6" },
    { label: "Flouci", value: 17, color: "#A855F7" },
    { label: t("payments.bank"), value: 11, color: "#F97316" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} delay={i * 100} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart data={specialtyData} delay={400} />
        <DonutChart data={paymentData} delay={500} />
      </div>

      <div className="dash-card fade-up stagger-6">
        <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{tc("recentStudents")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("users.name")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("users.email")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{tc("specialty")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("users.role")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("users.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
              {[
                { name: "أحمد بن علي", email: "ahmed@test.tn", specialty: "إعلامية", sub: "بريميوم", status: "نشط" },
                { name: "سارة المحمدي", email: "sara@test.tn", specialty: "طب", sub: "مجاني", status: "نشط" },
                { name: "محمد الصالح", email: "mohamed@test.tn", specialty: "حقوق", sub: "بريميوم", status: "نشط" },
                { name: "ليلى بن عمر", email: "lilia@test.tn", specialty: "اقتصاد", sub: "مجاني", status: "محظور" },
              ].map((u, i) => (
                <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-4 py-3 text-[#E8F5E0]">{u.name}</td>
                  <td className="px-4 py-3 text-[#9DBFAA]">{u.email}</td>
                  <td className="px-4 py-3 text-[#9DBFAA]">{u.specialty}</td>
                  <td className="px-4 py-3">
                    <span className={u.sub === "بريميوم" ? "badge-gold-dark" : "badge-grey"}>{u.sub}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.status === "نشط" ? "badge-green" : "badge-red"}>{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
