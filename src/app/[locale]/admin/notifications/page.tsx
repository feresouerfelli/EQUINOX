"use client";

import { useTranslations } from "next-intl";
import { Bell, Send } from "lucide-react";

export default function AdminNotificationsPage() {
  const t = useTranslations("admin.notifications");
  const tc = useTranslations("common");
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
      <div className="dash-card-flat fade-up">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell size={48} className="mb-4 text-[#4D7A60]" />
          <p className="text-sm text-[#9DBFAA]">{t("subtitle")}</p>
          <p className="mt-1 text-xs text-[#4D7A60]"> Broadcast to all users or specific groups</p>
        </div>
      </div>
    </div>
  );
}
