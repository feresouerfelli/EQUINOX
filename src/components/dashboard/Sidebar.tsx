"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ChevronLeft, ChevronRight, X, Star, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  key: string;
  icon: LucideIcon;
  href: string;
  label: string;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  role: "admin" | "professor" | "student";
  roleLabel: string;
  roleInitial: string;
  roleColor: string;
  professorProfile?: { name: string; specialty?: string; verified?: boolean };
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({
  items, role, roleLabel, roleInitial, roleColor, professorProfile, collapsed, onCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarKey = role === "admin" ? "adminSidebar" : role === "professor" ? "profSidebar" : "studentSidebar";
  const t = useTranslations(sidebarKey);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-[rgba(255,255,255,0.07)] px-4", collapsed ? "justify-center" : "gap-3")}>
        {!collapsed ? (
    <img src="/images/logo.svg" alt="EQUINOX" className="h-14" />
  ) : (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0B1F14] text-sm font-bold text-[#C9A84C]">
            E
          </div>
        )}
        {!collapsed && (
          <span className="text-xs text-[#4D7A60]">{roleLabel}</span>
        )}
      </div>

      {/* Professor Profile Hero */}
      {role === "professor" && !collapsed && professorProfile && (
        <div className="mx-3 mt-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A6B4A] text-sm font-bold text-[#E8F5E0]">
              {professorProfile.name[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#E8F5E0]">{professorProfile.name}</p>
              <p className="truncate text-xs text-[#4D7A60]">{professorProfile.specialty}</p>
            </div>
          </div>
          {professorProfile.verified && (
            <div className="mt-2 flex items-center gap-1 text-xs text-[#34D399]">
              <Star size={12} className="fill-[#34D399]" /> {t("verified")}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={item.key}
              onClick={() => { router.push(item.href); setMobileOpen(false); }}
              className={cn(
                isActive ? "sidebar-link-active" : "sidebar-link-inactive",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C9A84C] px-1.5 text-[10px] font-bold text-[#081810]">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[rgba(255,255,255,0.07)] p-3">
        <button
          onClick={() => onCollapse(!collapsed)}
          className={cn("sidebar-link-inactive mb-2 hidden lg:flex", collapsed && "justify-center px-2")}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} className={cn(isRTL && "rotate-180")} />}
          {!collapsed && <span className="text-xs">{t("collapse")}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn("sidebar-link-inactive text-red-400 hover:bg-red-500/10 hover:text-red-400", collapsed && "justify-center px-2")}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-40 hidden lg:flex flex-col border-r border-[rgba(255,255,255,0.07)] bg-[#0F1F15] transition-all duration-300",
          isRTL ? "right-0 border-r border-l-0" : "left-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className={cn(
            "absolute top-0 h-full w-64 bg-[#0F1F15] shadow-2xl flex flex-col",
            isRTL ? "right-0" : "left-0"
          )}>
            <div className="flex h-16 items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-4">
          <img src="/images/logo.svg" alt="EQUINOX" className="h-14" />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-[#4D7A60] hover:text-[#E8F5E0]">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.key}
                    onClick={() => { router.push(item.href); setMobileOpen(false); }}
                    className={cn(isActive ? "sidebar-link-active" : "sidebar-link-inactive")}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6B4A] text-[#E8F5E0] shadow-lg lg:hidden"
      >
        <LayoutDashboard size={20} />
      </button>
    </>
  );
}
