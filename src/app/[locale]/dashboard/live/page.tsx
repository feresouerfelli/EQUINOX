"use client";

import { Video, Radio, Clock, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const sessions = [
  { id: 1, title: "التحليل الرياضي - مراجعة عامة", prof: "أ. محمد", time: "14:00", status: "live", students: 45 },
  { id: 2, title: "هياكل البيانات - Binary Trees", prof: "أ. فاطمة", time: "16:00", status: "soon", students: 0 },
  { id: 3, title: "قواعد البيانات - SQL المتقدم", prof: "أ. أحمد", time: "غداً 10:00", status: "later", students: 0 },
];

export default function StudentLivePage() {
  const t = useTranslations("student.live");
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
      <div className="space-y-3">
        {sessions.map((s, i) => (
          <div key={s.id} className={cn(
            "dash-card-flat fade-up",
            s.status === "live" && "border-red-500/30 bg-red-500/5"
          )} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("relative h-3 w-3 rounded-full",
                  s.status === "live" ? "bg-red-500" : s.status === "soon" ? "bg-[#C9A84C]" : "bg-[#4D7A60]"
                )}>
                  {s.status === "live" && <div className="absolute inset-0 animate-ping rounded-full bg-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#E8F5E0]">{s.title}</p>
                  <p className="text-xs text-[#4D7A60]">{s.prof}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-[#9DBFAA]"><Clock size={12} /> {s.time}</span>
                {s.status === "live" && (
                  <span className="flex items-center gap-1 text-xs text-red-400"><Users size={12} /> {s.students}</span>
                )}
                <button className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                  s.status === "live" ? "bg-red-500 text-white hover:bg-red-600" : "bg-[rgba(255,255,255,0.05)] text-[#9DBFAA] hover:bg-[rgba(255,255,255,0.08)]"
                )}>
                  {s.status === "live" ? t("join") : s.status === "soon" ? t("reminder") : t("comingSoon")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
