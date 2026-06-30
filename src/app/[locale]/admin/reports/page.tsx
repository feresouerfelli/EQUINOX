"use client";

import { useTranslations } from "next-intl";
import { BarChart3, Download } from "lucide-react";

export default function AdminReportsPage() {
  const t = useTranslations("admin.reports");
  const tc = useTranslations("common");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
        <button className="btn-primary !py-2 !text-xs"><Download size={14} /> {t("export")}</button>
      </div>
      <div className="dash-card-flat fade-up">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 size={48} className="mb-4 text-[#4D7A60]" />
          <p className="text-sm text-[#9DBFAA]">{t("subtitle")}</p>
          <p className="mt-1 text-xs text-[#4D7A60]">{t("comingSoon")}</p>
        </div>
      </div>
    </div>
  );
}
