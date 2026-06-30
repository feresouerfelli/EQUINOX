"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { QrCode, Upload, CheckCircle, AlertTriangle, Clock, Copy, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "@/i18n/navigation";

type Step = "code" | "qr" | "upload" | "done";

export default function D17PaymentPage() {
  const t = useTranslations("d17");
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState("");
  const [copied, setCopied] = useState(false);

  // Upload form
  const [submittedCode, setSubmittedCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState("");

  // Generate code
  const generateCode = async () => {
    if (!token) return;
    setError("");
    try {
      const data = await api.get<{ code: string; expires_at: string; expires_in_minutes: number }>("/payments/generate-code", token);
      setCode(data.code);
      setExpiresAt(data.expires_at);
      setStep("qr");
    } catch (e: any) {
      setError(e.message || t("error"));
    }
  };

  // Timer
  useEffect(() => {
    if (step !== "qr" || !expiresAt) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
        setStep("code");
        setCode("");
        setError(t("codeExpired"));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step, expiresAt]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // File validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setClientError("");

    // Type check
    if (!["image/jpeg", "image/png", "image/jpg"].includes(f.type)) {
      setClientError(t("fileTypeInvalid"));
      return;
    }
    // Size check
    if (f.size < 50000) {
      setClientError(t("fileTooSmall"));
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setClientError(t("fileTooLarge"));
      return;
    }

    // Dimension check
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      if (img.width < 300 || img.height < 400) {
        setClientError(t("wrongDimensions"));
        URL.revokeObjectURL(url);
        return;
      }
      setFile(f);
      setPreview(url);
    };
    img.src = url;
  };

  // Submit
  const handleSubmit = async () => {
    if (!token || !file || !submittedCode) return;
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("submitted_code", submittedCode);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t("error"));
        setSubmitting(false);
        return;
      }

      setTicket(data.ticket);
      setStep("done");
    } catch {
      setError(t("connectionError"));
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {(["code", "qr", "upload", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              step === s ? "bg-[#0A6B4A] text-white" : i < ["code", "qr", "upload", "done"].indexOf(step) ? "bg-[#34D399] text-white" : "bg-[rgba(255,255,255,0.05)] text-[#4D7A60]"
            }`}>
              {i < ["code", "qr", "upload", "done"].indexOf(step) ? <CheckCircle size={16} /> : i + 1}
            </div>
            {i < 3 && <div className="h-px w-8 bg-[rgba(255,255,255,0.07)]" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400 fade-up">
          {error}
        </div>
      )}

      {/* Step 1: Generate Code */}
      {step === "code" && (
        <div className="dash-card-flat text-center fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C9A84C]/20">
            <QrCode size={32} className="text-[#C9A84C]" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#E8F5E0]">{t("title")}</h2>
          <p className="mt-2 text-sm text-[#9DBFAA]">{t("amountLabel")}: <span className="font-bold text-[#C9A84C]">39 {t("amountLabel")}</span> / {t("monthly")}</p>
          <p className="mt-4 text-xs text-[#4D7A60]">{t("codeInfo")}</p>
          <button onClick={generateCode} className="btn-primary mt-6 !py-3">
            {t("generateCode")}
          </button>
        </div>
      )}

      {/* Step 2: Show QR + Code */}
      {step === "qr" && (
        <div className="dash-card-flat text-center fade-up">
          <h2 className="text-lg font-bold text-[#E8F5E0]">{t("payWithD17")}</h2>

          {/* QR Code */}
          <div className="mx-auto mt-4 flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.1)] bg-white">
            <div className="text-center text-[#081810]">
              <QrCode size={64} className="mx-auto text-[#081810]" />
              <p className="mt-2 text-xs font-medium">QR Code</p>
            </div>
          </div>

          {/* Unique Code */}
          <div className="mt-6 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-4">
            <p className="text-xs text-[#9DBFAA]">{t("addCodeNote")}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-bold tracking-wider text-[#C9A84C]">{code}</span>
              <button onClick={copyCode} className="rounded-lg p-2 text-[#C9A84C] hover:bg-[#C9A84C]/10">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-red-400">⚠️ {t("codeWarning")}</p>
          </div>

          {/* Timer */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#9DBFAA]">
            <Clock size={14} />
            <span>{t("validFor")} <span className={`font-bold ${timeLeft < 300 ? "text-red-400" : "text-[#C9A84C]"}`}>{formatTime(timeLeft)}</span></span>
          </div>

          <button onClick={() => setStep("upload")} className="btn-primary mt-6 !py-3">
            {t("uploadProof")} <ArrowLeft size={16} />
          </button>

          <button onClick={generateCode} className="btn-ghost mt-2 !text-xs">
            {t("newCode")}
          </button>
        </div>
      )}

      {/* Step 3: Upload Screenshot */}
      {step === "upload" && (
        <div className="dash-card-flat fade-up">
          <h2 className="mb-4 text-lg font-bold text-[#E8F5E0]">{t("uploadProof")}</h2>

          {/* Unique Code Display */}
          <div className="mb-4 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-3 text-center">
            <p className="text-[10px] text-[#9DBFAA]">{t("yourCode")}</p>
            <p className="font-mono text-lg font-bold text-[#C9A84C]">{code}</p>
          </div>

          {/* Code confirmation */}
          <div className="mb-4">
            <label className="mb-1 block text-xs text-[#4D7A60]">{t("enterCode")}</label>
            <input
              value={submittedCode}
              onChange={(e) => setSubmittedCode(e.target.value)}
              placeholder={t("codePlaceholder")}
              className="input-dark font-mono text-center tracking-wider"
            />
            {submittedCode && submittedCode !== code && (
              <p className="mt-1 text-[10px] text-red-400">⚠️ {t("codeMismatch")}</p>
            )}
          </div>

          {/* File upload */}
          <div className="mb-4">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="hidden" />
            <div
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                file ? "border-[#34D399] bg-[#34D399]/5" : clientError ? "border-red-500/50 bg-red-500/5" : "border-[rgba(255,255,255,0.1)] hover:border-[#C9A84C]"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Screenshot" className="mx-auto max-h-48 rounded-lg" />
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-[#4D7A60]" />
                  <p className="mt-2 text-sm text-[#9DBFAA]">{t("clickToUpload")}</p>
                  <p className="mt-1 text-[10px] text-[#4D7A60]">{t("fileTypes")}</p>
                </>
              )}
            </div>
            {clientError && <p className="mt-1 text-[10px] text-red-400">{clientError}</p>}
          </div>

          {/* Warning */}
          <div className="mb-4 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-3 text-xs text-[#9DBFAA]">
            <AlertTriangle size={14} className="mr-1 inline text-[#C9A84C]" />
            {t("warning")}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !file || !submittedCode || submittedCode !== code}
            className="btn-primary w-full !py-3"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : t("submitPayment")}
          </button>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <div className="dash-card-flat text-center fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34D399]/20">
            <CheckCircle size={32} className="text-[#34D399]" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#E8F5E0]">{t("submittedSuccess")}</h2>
          <p className="mt-2 text-sm text-[#9DBFAA]">{t("ticketNumber")} <span className="font-mono font-bold text-[#C9A84C]">{ticket}</span></p>
          <p className="mt-2 text-xs text-[#4D7A60]">{t("reviewMessage")}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => router.push("/dashboard")} className="btn-primary flex-1 !py-3">{t("goToDashboard")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
