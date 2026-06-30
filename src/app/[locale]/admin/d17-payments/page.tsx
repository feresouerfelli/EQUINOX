"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Loader2, Filter, Eye, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentRequest {
  id: number;
  user: { id: number; name: string; email: string; phone: string };
  submitted_code: string;
  code_match: boolean;
  amount_dt: string;
  ticket_number: string;
  screenshot_path: string;
  image_width: number | null;
  image_height: number | null;
  has_exif: boolean;
  image_exif_date: string | null;
  fraud_score: "clean" | "warning" | "suspect";
  fraud_flags: string[];
  fraud_flags_labels: string[];
  status: string;
  previous_bad_count: number;
  created_at: string;
}

export default function AdminD17PaymentsPage() {
  const t = useTranslations("admin.d17");
  const tc = useTranslations("common");
  const token = useAuthStore((s) => s.token);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [fraudReason, setFraudReason] = useState("");
  const [showReject, setShowReject] = useState<number | null>(null);
  const [showFraud, setShowFraud] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.get<any>(`/admin/payment-requests?status=${filter}&page=${page}`, token);
      setRequests(data.data || []);
      setLastPage(data.last_page || 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [token, filter, page]);

  const viewScreenshot = async (id: number) => {
    if (!token) return;
    try {
      const data = await api.get<{ url: string }>(`/admin/payment-requests/${id}/screenshot`, token);
      setScreenshotUrl(data.url);
      setSelected(requests.find((r) => r.id === id) || null);
    } catch {}
  };

  const approve = async (id: number) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/payment-requests/${id}/approve`, {}, token);
      fetchRequests();
      setSelected(null);
    } catch {}
    setActionLoading(null);
  };

  const reject = async (id: number) => {
    if (!token || !rejectReason) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/payment-requests/${id}/reject`, { reason: rejectReason }, token);
      fetchRequests();
      setSelected(null);
      setShowReject(null);
      setRejectReason("");
    } catch {}
    setActionLoading(null);
  };

  const reportFraud = async (id: number) => {
    if (!token || !fraudReason) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/payment-requests/${id}/fraud`, { reason: fraudReason }, token);
      fetchRequests();
      setSelected(null);
      setShowFraud(null);
      setFraudReason("");
    } catch {}
    setActionLoading(null);
  };

  const scoreConfig = {
    clean: { color: "text-[#1D9E75]", bg: "bg-[#1D9E75]/10", border: "border-[#1D9E75]/30", label: "CLEAN", labelAr: t("clean") },
    warning: { color: "text-[#EF9F27]", bg: "bg-[#EF9F27]/10", border: "border-[#EF9F27]/30", label: "WARNING", labelAr: t("warning") },
    suspect: { color: "text-[#E24B4A]", bg: "bg-[#E24B4A]/10", border: "border-[#E24B4A]/30", label: "SUSPECT", labelAr: t("suspect") },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: t("pending"), color: "badge-yellow" },
    approved: { label: t("approved"), color: "badge-green" },
    rejected: { label: t("rejected"), color: "badge-red" },
    fraud: { label: t("fraudLabel"), color: "badge-red" },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>

      {/* Filters */}
      <div className="flex gap-2">
        {["pending", "approved", "rejected", "fraud"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all", filter === s ? "bg-[#0A6B4A] text-white" : "bg-[rgba(255,255,255,0.05)] text-[#9DBFAA]")}
          >
            {statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#4D7A60]"><Loader2 size={24} className="mx-auto animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#4D7A60]">{t("noRequests")}</div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const sc = scoreConfig[req.fraud_score];
            return (
              <div key={req.id} className={cn("dash-card-flat fade-up border-l-4", sc.border)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", sc.bg, sc.color)}>
                        {sc.label}
                      </span>
                      <span className="font-mono text-xs text-[#4D7A60]">{req.ticket_number}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px]", statusConfig[req.status]?.color)}>
                        {statusConfig[req.status]?.label}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#4D7A60]">{t("student")}: </span>
                        <span className="text-[#E8F5E0]">{req.user?.name}</span>
                      </div>
                      <div>
                        <span className="text-[#4D7A60]">{t("email")}: </span>
                        <span className="text-[#9DBFAA]">{req.user?.email}</span>
                      </div>
                      <div>
                        <span className="text-[#4D7A60]">{t("phone")}: </span>
                        <span className="text-[#9DBFAA]">{req.user?.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[#4D7A60]">{t("amount")}: </span>
                        <span className="text-[#C9A84C] font-bold">{req.amount_dt} {tc("dt")}</span>
                      </div>
                    </div>

                    {/* Code match */}
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className={req.code_match ? "text-[#34D399]" : "text-red-400"}>
                        {req.code_match ? t("codeMatch") : t("codeMismatch")}
                      </span>
                      <span className="text-[#4D7A60]">
                        {t("codeLabel")}: <span className="font-mono text-[#9DBFAA]">{req.submitted_code}</span>
                      </span>
                    </div>

                    {/* Image info */}
                    <div className="mt-2 flex items-center gap-4 text-[10px] text-[#4D7A60]">
                      {req.image_width && <span>{req.image_width}×{req.image_height}px</span>}
                      <span>{tc("exif")}: {req.has_exif ? tc("yes") : tc("no")}</span>
                      {req.image_exif_date && <span>{t("imageDate")} {new Date(req.image_exif_date).toLocaleDateString("ar-TN")}</span>}
                      {req.previous_bad_count > 0 && <span className="text-red-400">{t("rejectedRequests")} {req.previous_bad_count}</span>}
                    </div>

                    {/* Fraud flags */}
                    {req.fraud_flags_labels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {req.fraud_flags_labels.map((flag, i) => (
                          <span key={i} className="rounded bg-[#EF9F27]/10 px-1.5 py-0.5 text-[10px] text-[#EF9F27]">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button onClick={() => viewScreenshot(req.id)} className="btn-ghost !px-2 !py-1 !text-[10px]">
                      <Eye size={12} />
                    </button>
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => approve(req.id)}
                          disabled={actionLoading === req.id}
                          className="rounded-lg bg-[#0A6B4A]/20 p-2 text-[#34D399] hover:bg-[#0A6B4A]/30 disabled:opacity-50"
                        >
                          {actionLoading === req.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => setShowReject(req.id)} className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20">
                          <XCircle size={14} />
                        </button>
                        <button onClick={() => setShowFraud(req.id)} className="rounded-lg bg-[#EF9F27]/10 p-2 text-[#EF9F27] hover:bg-[#EF9F27]/20">
                          <Flag size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Reject modal */}
                {showReject === req.id && (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t("rejectReason")}
                      className="input-dark mb-2 !py-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => reject(req.id)} disabled={!rejectReason} className="btn-primary !py-1.5 !text-xs">{t("confirmReject")}</button>
                      <button onClick={() => { setShowReject(null); setRejectReason(""); }} className="btn-ghost !py-1.5 !text-xs">{tc("cancel")}</button>
                    </div>
                  </div>
                )}

                {/* Fraud modal */}
                {showFraud === req.id && (
                  <div className="mt-3 rounded-lg border border-[#EF9F27]/20 bg-[#EF9F27]/5 p-3">
                    <input
                      value={fraudReason}
                      onChange={(e) => setFraudReason(e.target.value)}
                      placeholder={t("fraudReason")}
                      className="input-dark mb-2 !py-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => reportFraud(req.id)} disabled={!fraudReason} className="rounded-lg bg-[#EF9F27] px-3 py-1.5 text-xs font-medium text-[#081810]">{t("reportFraud")}</button>
                      <button onClick={() => { setShowFraud(null); setFraudReason(""); }} className="btn-ghost !py-1.5 !text-xs">{tc("cancel")}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-ghost !px-3 !py-1.5 !text-xs">{tc("previous")}</button>
          <span className="text-xs text-[#4D7A60]">{page} / {lastPage}</span>
          <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} className="btn-ghost !px-3 !py-1.5 !text-xs">{tc("next")}</button>
        </div>
      )}

      {/* Screenshot Modal */}
      {screenshotUrl && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => { setScreenshotUrl(null); setSelected(null); }}>
          <div className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F1F15] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs text-[#4D7A60]">{selected.ticket_number}</span>
              <button onClick={() => { setScreenshotUrl(null); setSelected(null); }} className="text-[#4D7A60] hover:text-[#E8F5E0]">✕</button>
            </div>
            <img src={screenshotUrl} alt="Screenshot" className="mx-auto max-h-[70vh] rounded-lg" />
            <div className="mt-3 text-center text-xs text-[#4D7A60]">
              {selected.image_width}×{selected.image_height}px · {tc("exif")}: {selected.has_exif ? tc("yes") : tc("no")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
