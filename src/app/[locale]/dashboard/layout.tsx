"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store";
import {
  Home, BookOpen, Video, Brain, MessageSquare, Download,
  User, CreditCard, QrCode, Settings,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ToastContainer } from "@/components/dashboard/Toast";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import type { SidebarItem } from "@/components/dashboard/Sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("studentSidebar");
  const userId = useAuthStore((s) => s.user?.id);
  const { toasts, removeToast } = useRealtimeNotifications(userId ?? null);

  const items: SidebarItem[] = [
    { key: "home", icon: Home, href: "/dashboard", label: t("home") },
    { key: "courses", icon: BookOpen, href: "/dashboard/courses", label: t("courses") },
    { key: "live", icon: Video, href: "/dashboard/live", label: t("live") },
    { key: "ai", icon: Brain, href: "/dashboard/ai", label: t("ai") },
    { key: "forum", icon: MessageSquare, href: "/dashboard/forum", label: t("forum") },
    { key: "downloads", icon: Download, href: "/dashboard/downloads", label: t("downloads") },
    { key: "profile", icon: User, href: "/dashboard/profile", label: t("profile") },
    { key: "subscription", icon: CreditCard, href: "/dashboard/subscription", label: t("subscription") },
    { key: "d17-payment", icon: QrCode, href: "/dashboard/d17-payment", label: "D17" },
    { key: "settings", icon: Settings, href: "/dashboard/settings", label: t("settings") },
  ];

  return (
    <DashboardLayout
      role="student"
      roleLabel="Student"
      roleInitial="S"
      roleColor="bg-[#0A6B4A]"
      items={items}
      topbarTitle="EQUINOX"
      topbarSubtitle="Student"
    >
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {children}
    </DashboardLayout>
  );
}
