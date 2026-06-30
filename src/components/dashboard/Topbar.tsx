"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Search, Bell, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useNotificationStore } from "@/lib/store";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/navigation";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const t = useTranslations("topbar");
  const { user } = useAuthStore();
  const { unreadCount, markAllRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[#081810]/95 px-4 backdrop-blur-md lg:px-6">
      {/* Left: Title */}
      <div>
        <h1 className="text-lg font-bold text-[#E8F5E0]">{title}</h1>
        {subtitle && <p className="text-xs text-[#4D7A60]">{subtitle}</p>}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language */}
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative rounded-lg p-2 text-[#9DBFAA] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E8F5E0] transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[10px] font-bold text-[#081810]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0F1F15] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-4 py-3">
                <span className="text-sm font-semibold text-[#E8F5E0]">{t("notifications")}</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#C9A84C] hover:underline">
                    {t("markAllRead")}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {unreadCount === 0 ? (
                  <div className="p-6 text-center text-sm text-[#4D7A60]">{t("noNotifications")}</div>
                ) : (
                  <div className="space-y-1 p-2">
                    {[1, 2, 3].slice(0, unreadCount).map((i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg p-3 hover:bg-[rgba(255,255,255,0.03)]">
                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#C9A84C]" />
                        <div>
                          <p className="text-xs text-[#E8F5E0]">{t("newNotification")} #{i}</p>
                          <p className="text-[10px] text-[#4D7A60]">#{i}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A6B4A] text-xs font-bold text-[#E8F5E0]">
              {user?.name?.[0] || "U"}
            </div>
            <span className="hidden text-sm font-medium text-[#E8F5E0] sm:block">{user?.name}</span>
            <ChevronDown size={14} className="hidden text-[#4D7A60] sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0F1F15] shadow-2xl p-2">
              <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.07)] mb-1">
                <p className="text-sm font-semibold text-[#E8F5E0]">{user?.name}</p>
                <p className="text-xs text-[#4D7A60]">{user?.email}</p>
              </div>
              <Link
                href={user?.role === "admin" ? "/admin/settings" : user?.role === "professor" ? "/professor/settings" : "/dashboard/profile"}
                onClick={() => setShowProfile(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9DBFAA] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E8F5E0]"
              >
                {t("profile")}
              </Link>
              <Link
                href={user?.role === "admin" ? "/admin/settings" : user?.role === "professor" ? "/professor/settings" : "/dashboard/settings"}
                onClick={() => setShowProfile(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9DBFAA] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E8F5E0]"
              >
                {t("settings")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
