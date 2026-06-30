"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import {
  Shield, ShieldAlert, ShieldOff, Ban, AlertTriangle,
  Activity, RefreshCw, Globe, Clock, CheckCircle, XCircle,
} from "lucide-react";

interface SecurityStats {
  stats: {
    total_attacks: number;
    today_attacks: number;
    blocked_ips: number;
    pending_review: number;
    healthy_requests: number;
  };
  breakdown: Record<string, number>;
}

interface SecurityLog {
  id: number;
  event_type: string;
  ip_address: string;
  endpoint: string;
  user_agent: string | null;
  blocked: boolean;
  created_at: string;
}

interface BlockedIp {
  id: number;
  ip_address: string;
  reason: string;
  blocked_type: string;
  blocked_until: string | null;
  attempt_count: number;
  created_at: string;
}

const ATTACK_COLORS: Record<string, string> = {
  brute_force: "bg-yellow-500/20 text-yellow-400",
  sql_injection: "bg-red-500/20 text-red-400",
  xss: "bg-orange-500/20 text-orange-400",
  ddos: "bg-purple-500/20 text-purple-400",
  file_upload: "bg-pink-500/20 text-pink-400",
  csrf: "bg-indigo-500/20 text-indigo-400",
  bot_scan: "bg-cyan-500/20 text-cyan-400",
  path_traversal: "bg-red-500/20 text-red-400",
  fraud: "bg-amber-500/20 text-amber-400",
};

const ATTACK_LABELS: Record<string, string> = {
  brute_force: "Brute Force",
  sql_injection: "SQL Injection",
  xss: "XSS",
  ddos: "DDoS",
  file_upload: "File Upload",
  csrf: "CSRF",
  bot_scan: "Bot Scanner",
  path_traversal: "Path Traversal",
  fraud: "Fraud",
};

export default function SecurityPage() {
  const t = useTranslations("security");
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockIp, setBlockIp] = useState("");
  const [blockReason, setBlockReason] = useState<string>("manual");

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, logsRes, ipsRes] = await Promise.all([
        api.get<SecurityStats>("/admin/security/stats"),
        api.get<SecurityLog[]>("/admin/security/logs?per_page=30"),
        api.get<BlockedIp[]>("/admin/security/blocked-ips"),
      ]);
      setStats(statsRes);
      setLogs(Array.isArray(logsRes) ? logsRes : []);
      setBlockedIps(Array.isArray(ipsRes) ? ipsRes : []);
    } catch (err) {
      console.error("Failed to load security data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBlockIp = async () => {
    if (!blockIp) return;
    try {
      await api.post("/admin/security/block-ip", {
        ip_address: blockIp,
        reason: blockReason,
        blocked_type: "permanent",
      });
      setBlockIp("");
      fetchData();
    } catch {}
  };

  const handleUnblockIp = async (ip: string) => {
    try {
      await api.delete(`/admin/security/blocked-ips/${ip}`);
      fetchData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const kpis = [
    { label: t("attacksBlocked"), value: stats?.stats.total_attacks ?? 0, icon: ShieldAlert, color: "text-red-400" },
    { label: t("todayAttacks"), value: stats?.stats.today_attacks ?? 0, icon: Activity, color: "text-orange-400" },
    { label: t("blockedIps"), value: stats?.stats.blocked_ips ?? 0, icon: Ban, color: "text-purple-400" },
    { label: t("healthyTraffic"), value: stats?.stats.healthy_requests ?? 0, icon: CheckCircle, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} />
          {t("refresh")}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-white/5 p-2 ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{kpi.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attack Breakdown */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{t("attackBreakdown")}</h2>
          {stats?.breakdown && Object.keys(stats.breakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.breakdown).map(([type, count]) => {
                const total = Object.values(stats.breakdown).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${ATTACK_COLORS[type] || "bg-gray-500/20 text-gray-400"}`}>
                        {ATTACK_LABELS[type] || type}
                      </span>
                      <span className="text-sm text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("noAttacks")}</p>
          )}
        </div>

        {/* Block IP Form */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{t("blockIpAddress")}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="192.168.1.1"
              value={blockIp}
              onChange={(e) => setBlockIp(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
            <select
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="manual">{t("reasons.manual")}</option>
              <option value="ddos">{t("reasons.ddos")}</option>
              <option value="brute_force">{t("reasons.brute_force")}</option>
              <option value="sql_injection">{t("reasons.sql_injection")}</option>
              <option value="fraud">{t("reasons.fraud")}</option>
            </select>
            <button onClick={handleBlockIp} className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors">
              <Ban size={14} className="mr-2 inline" />
              {t("blockIp")}
            </button>
          </div>
        </div>
      </div>

      {/* Blocked IPs */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">{t("blockedIpList")}</h2>
        {blockedIps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-gray-500">
                  <th className="pb-3 pr-4">{t("ip")}</th>
                  <th className="pb-3 pr-4">{t("reason")}</th>
                  <th className="pb-3 pr-4">{t("type")}</th>
                  <th className="pb-3 pr-4">{t("attempts")}</th>
                  <th className="pb-3 pr-4">{t("date")}</th>
                  <th className="pb-3">{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {blockedIps.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-white">{item.ip_address}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                        {item.reason}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs ${item.blocked_type === "permanent" ? "text-red-400" : "text-yellow-400"}`}>
                        {item.blocked_type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{item.attempt_count}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleUnblockIp(item.ip_address)}
                        className="rounded bg-emerald-600/20 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                      >
                        {t("unblock")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("noBlockedIps")}</p>
        )}
      </div>

      {/* Attack Log */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">{t("recentLogs")}</h2>
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-gray-500">
                  <th className="pb-3 pr-4">{t("type")}</th>
                  <th className="pb-3 pr-4">{t("ip")}</th>
                  <th className="pb-3 pr-4">{t("endpoint")}</th>
                  <th className="pb-3 pr-4">{t("status")}</th>
                  <th className="pb-3">{t("date")}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${ATTACK_COLORS[log.event_type] || "bg-gray-500/20 text-gray-400"}`}>
                        {ATTACK_LABELS[log.event_type] || log.event_type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-white">{log.ip_address}</td>
                    <td className="py-3 pr-4 text-gray-400">{log.endpoint}</td>
                    <td className="py-3 pr-4">
                      {log.blocked ? (
                        <XCircle size={14} className="text-red-400" />
                      ) : (
                        <CheckCircle size={14} className="text-emerald-400" />
                      )}
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("noLogs")}</p>
        )}
      </div>
    </div>
  );
}
