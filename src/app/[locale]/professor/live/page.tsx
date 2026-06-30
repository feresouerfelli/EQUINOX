"use client";

import { useEffect, useState } from "react";
import { Video, Plus, Play, Clock, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ProfessorLivePage() {
  const t = useTranslations("professor.live");
  const token = useAuthStore((s) => s.token);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<any>("/professor/live-sessions", token)
      .then((data) => setSessions(data.data || []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary !py-2 !text-xs"><Plus size={14} /> {t("newSchedule")}</button>
      </div>

      {isLive && (
        <div className="dash-card-flat border-red-500/30 bg-red-500/5 fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#E8F5E0]">{t("activeLive")}</p>
                <p className="text-xs text-[#9DBFAA]">{formatTime(timer)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-[#9DBFAA]"><Users size={12} /> --</span>
              <button onClick={() => { setIsLive(false); setTimer(0); }} className="btn-danger !py-1.5 !text-xs">{t("end")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((s, i) => (
          <div key={s.id || i} className="dash-card-flat flex items-center justify-between fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
              <div className={cn("h-2 w-2 rounded-full", s.status === "live" ? "bg-red-500" : s.status === "scheduled" ? "bg-[#C9A84C]" : "bg-[#4D7A60]")} />
              <div>
                <p className="text-sm font-medium text-[#E8F5E0]">{s.title}</p>
                <p className="text-xs text-[#4D7A60]">{s.course?.title_fr || s.course?.title_ar}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#9DBFAA]"><Clock size={12} className="inline" /> {new Date(s.scheduled_at).toLocaleString("fr-TN")}</span>
              {s.status === "scheduled" && (
                <button onClick={() => setIsLive(true)} className="btn-primary !py-1.5 !text-xs"><Play size={12} /> {t("start")}</button>
              )}
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="dash-card-flat py-12 text-center text-sm text-[#4D7A60]">{t("noSessions")}</div>
        )}
      </div>
    </div>
  );
}
