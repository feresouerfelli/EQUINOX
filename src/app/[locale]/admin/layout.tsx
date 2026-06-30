"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Video, CreditCard,
  BarChart3, Bell, Settings, QrCode, Shield,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ToastContainer } from "@/components/dashboard/Toast";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import type { SidebarItem } from "@/components/dashboard/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("adminSidebar");
  const userId = useAuthStore((s) => s.user?.id);
  const { toasts, removeToast } = useRealtimeNotifications(userId ?? null);

  const items: SidebarItem[] = [
    { key: "home", icon: LayoutDashboard, href: "/admin", label: t("home") },
    { key: "users", icon: Users, href: "/admin/users", label: t("users") },
    { key: "professors", icon: GraduationCap, href: "/admin/professors", label: t("professors") },
    { key: "courses", icon: BookOpen, href: "/admin/courses", label: t("courses") },
    { key: "live", icon: Video, href: "/admin/live", label: t("live") },
    { key: "payments", icon: CreditCard, href: "/admin/payments", label: t("payments") },
    { key: "d17", icon: QrCode, href: "/admin/d17-payments", label: "D17" },
    { key: "reports", icon: BarChart3, href: "/admin/reports", label: t("reports") },
    { key: "security", icon: Shield, href: "/admin/security", label: t("security") },
    { key: "notifications", icon: Bell, href: "/admin/notifications", label: t("notifications") },
    { key: "settings", icon: Settings, href: "/admin/settings", label: t("settings") },
  ];

  return (
    <DashboardLayout
      role="admin"
      roleLabel="Admin"
      roleInitial="A"
      roleColor="bg-red-600"
      items={items}
      topbarTitle="EQUINOX"
      topbarSubtitle="EQUINOX"
    >
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {children}
    </DashboardLayout>
  );
}
