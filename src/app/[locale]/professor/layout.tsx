"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard, BookOpen, Users, Video, Upload, FileText,
  HelpCircle, BarChart3, Settings,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ToastContainer } from "@/components/dashboard/Toast";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import type { SidebarItem } from "@/components/dashboard/Sidebar";
import { api } from "@/lib/api";

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("profSidebar");
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const { toasts, removeToast } = useRealtimeNotifications(userId ?? null);
  const [profile, setProfile] = useState<{ name: string; specialty?: string; verified?: boolean }>({ name: "Professor" });

  useEffect(() => {
    if (!token) return;
    api.get<{ user: { name: string }; professor: { specialty?: string; is_verified?: boolean } | null }>("/professor/profile", token)
      .then((data) => setProfile({
        name: data.user.name,
        specialty: data.professor?.specialty,
        verified: data.professor?.is_verified,
      }))
      .catch(() => {});
  }, [token]);

  const items: SidebarItem[] = [
    { key: "home", icon: LayoutDashboard, href: "/professor", label: t("overview") },
    { key: "courses", icon: BookOpen, href: "/professor/courses", label: t("myCourses") },
    { key: "students", icon: Users, href: "/professor/students", label: t("students") },
    { key: "live", icon: Video, href: "/professor/live", label: t("liveSessions") },
    { key: "uploads", icon: Upload, href: "/professor/uploads", label: t("uploads") },
    { key: "pdfs", icon: FileText, href: "/professor/pdfs", label: t("pdfs") },
    { key: "questions", icon: HelpCircle, href: "/professor/questions", label: t("questions") },
    { key: "analytics", icon: BarChart3, href: "/professor/analytics", label: t("analytics") },
    { key: "settings", icon: Settings, href: "/professor/settings", label: t("settings") },
  ];

  return (
    <DashboardLayout
      role="professor"
      roleLabel="Professor"
      roleInitial="P"
      roleColor="bg-[#0A6B4A]"
      items={items}
      topbarTitle="EQUINOX"
      topbarSubtitle={profile.name}
      professorProfile={profile}
    >
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {children}
    </DashboardLayout>
  );
}
