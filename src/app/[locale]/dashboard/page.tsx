"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Video, Brain, TrendingUp, Zap, Award } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { ProgressRing } from "@/components/dashboard/Widgets";
import { Link } from "@/i18n/navigation";

export default function StudentHomePage() {
  const t = useTranslations("dashboard");
  const token = useAuthStore((s) => s.token);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    api.get<any>("/student/courses", token).then(setCourses).catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="dash-card-flat border-[#C9A84C]/20 bg-gradient-to-l from-[#C9A84C]/10 to-[#142918] fade-up">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E8F5E0]">{t("welcome")} 👋</h2>
            <p className="mt-1 text-sm text-[#9DBFAA]">{t("welcomeSubtitle")}</p>
            <button className="mt-3 btn-primary !py-2 !text-xs">{t("continueBtn")}</button>
          </div>
          <div className="flex gap-4">
            <div className="text-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3">
              <Zap size={20} className="mx-auto mb-1 text-[#C9A84C]" />
              <p className="text-lg font-bold text-[#E8F5E0]">7</p>
              <p className="text-[10px] text-[#4D7A60]">{t("streak", { days: 7 })}</p>
            </div>
            <div className="text-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3">
              <TrendingUp size={20} className="mx-auto mb-1 text-[#34D399]" />
              <p className="text-lg font-bold text-[#E8F5E0]">51%</p>
              <p className="text-[10px] text-[#4D7A60]">{t("completionRate")}</p>
            </div>
            <div className="text-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3">
              <Award size={20} className="mx-auto mb-1 text-[#A855F7]" />
              <p className="text-lg font-bold text-[#E8F5E0]">3</p>
              <p className="text-[10px] text-[#4D7A60]">{t("badges")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Rings */}
      <div className="dash-card-flat fade-up stagger-2">
        <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("progressTitle")}</h3>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <ProgressRing value={73} label="Quick Sort" sublabel="Data Structures" color="#0A6B4A" />
          <ProgressRing value={51} label="Calculus" sublabel="Mathematics" color="#C9A84C" />
          <ProgressRing value={27} label="Business Law" sublabel="Law" color="#3B82F6" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 fade-up stagger-3">
        {[
          { icon: BookOpen, label: t("myCourses"), color: "bg-[#0A6B4A]/20 text-[#34D399]", href: "/dashboard/courses" },
          { icon: Brain, label: "AI Notebook", color: "bg-[#C9A84C]/20 text-[#C9A84C]", href: "/dashboard/ai" },
          { icon: Video, label: t("live"), color: "bg-red-500/20 text-red-400", href: "/dashboard/live" },
          { icon: BookOpen, label: t("forum"), color: "bg-purple-500/20 text-purple-400", href: "/dashboard/forum" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className={`dash-card text-center block ${item.color.split(" ")[0]} hover:scale-105 transition-transform`}
            >
              <Icon size={24} className={`mx-auto ${item.color.split(" ")[1]}`} />
              <p className={`mt-2 text-xs font-medium ${item.color.split(" ")[1]}`}>{item.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
