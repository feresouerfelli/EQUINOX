"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import AuthGuard from "@/components/AuthGuard";
import Sidebar, { type SidebarItem } from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "professor" | "student";
  roleLabel: string;
  roleInitial: string;
  roleColor: string;
  items: SidebarItem[];
  topbarTitle: string;
  topbarSubtitle?: string;
  professorProfile?: { name: string; specialty?: string; verified?: boolean };
}

export default function DashboardLayout({
  children, role, roleLabel, roleInitial, roleColor, items, topbarTitle, topbarSubtitle, professorProfile,
}: DashboardLayoutProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard allowedRoles={[role]}>
      <div className="flex min-h-screen bg-[#081810]">
        <Sidebar
          items={items}
          role={role}
          roleLabel={roleLabel}
          roleInitial={roleInitial}
          roleColor={roleColor}
          professorProfile={professorProfile}
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />

        <div className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isRTL 
            ? (collapsed ? "lg:mr-20" : "lg:mr-64") 
            : (collapsed ? "lg:ml-20" : "lg:ml-64")
        )}>
          <Topbar title={topbarTitle} subtitle={topbarSubtitle} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
