"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Smartphone, CreditCard, QrCode, Building2, Download } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { FilterChips, KPICard } from "@/components/dashboard/Widgets";

export default function AdminPaymentsPage() {
  const t = useTranslations("admin.payments");
  const tc = useTranslations("common");
  const token = useAuthStore((s) => s.token);
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (methodFilter !== "all") params.set("method", methodFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    api.get<any>(`/admin/payments?${params}`, token)
      .then((data) => setPayments(data.data || []))
      .catch(() => {});
  }, [token, methodFilter, statusFilter]);

  const methodBadge = (m: string) => {
    switch (m) {
      case "d17": return <span className="badge-gold-dark">D17</span>;
      case "konnect": return <span className="badge-blue">Konnect</span>;
      case "flouci": return <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400">Flouci</span>;
      case "bank": return <span className="badge-grey">{t("bankTransfer")}</span>;
      default: return <span className="badge-grey">{m}</span>;
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "success": return <span className="badge-green">{t("success")}</span>;
      case "pending": return <span className="badge-gold-dark">{t("pending")}</span>;
      case "failed": return <span className="badge-red">{t("failed")}</span>;
      default: return <span className="badge-grey">{s}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="D17" value={44} icon={Smartphone} color="bg-[#C9A84C]/20 text-[#C9A84C]" trend={t("mostUsed")} delay={0} />
        <KPICard label="Konnect" value={28} icon={CreditCard} color="bg-blue-500/20 text-blue-400" delay={100} />
        <KPICard label="Flouci" value={17} icon={QrCode} color="bg-purple-500/20 text-purple-400" delay={200} />
        <KPICard label={t("bankTransfer")} value={11} icon={Building2} color="bg-orange-500/20 text-orange-400" delay={300} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D7A60]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="input-dark !pl-10" />
        </div>
        <FilterChips
          options={[
            { key: "all", label: t("all") }, { key: "d17", label: "D17" }, { key: "konnect", label: "Konnect" }, { key: "flouci", label: "Flouci" }, { key: "bank", label: t("bankTransfer") },
          ]}
          selected={methodFilter} onSelect={setMethodFilter}
        />
        <FilterChips
          options={[{ key: "all", label: t("all") }, { key: "success", label: t("success") }, { key: "pending", label: t("pending") }, { key: "failed", label: t("failed") }]}
          selected={statusFilter} onSelect={setStatusFilter}
        />
      </div>

      <div className="dash-card-flat fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("student")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("amount")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("gateway")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("reference")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("date")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("status")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#4D7A60]">{t("invoice")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
              {payments.map((p, i) => (
                <tr key={p.id || i} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-4 py-3 text-[#E8F5E0]">#{p.user_id}</td>
                  <td className="px-4 py-3 font-medium text-[#C9A84C]">{Number(p.amount_dt).toLocaleString()} DT</td>
                  <td className="px-4 py-3">{methodBadge(p.gateway)}</td>
                  <td className="px-4 py-3 text-xs text-[#4D7A60] font-mono">{p.gateway_reference || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#9DBFAA]">{new Date(p.created_at).toLocaleDateString("fr-TN")}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg p-1.5 text-[#4D7A60] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E8F5E0]">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#4D7A60]">{t("noPayments")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-sm text-[#C9A84C] font-semibold">
        {t("totalRevenue")} {payments.filter((p) => p.status === "success").reduce((s, p) => s + Number(p.amount_dt), 0).toLocaleString()} {tc("dt")}
      </div>
    </div>
  );
}
