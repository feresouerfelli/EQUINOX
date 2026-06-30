"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function OTPVerifyPage() {
  const t = useTranslations("auth.otp");
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((c) => c !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      router.push("/dashboard");
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white"
          >
            E
          </Link>
          <h1 className="mb-2 text-2xl font-bold text-emerald-900">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </div>

        <div className="card">
          <div className="flex justify-center gap-3">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-12 rounded-lg border border-ivory-300 bg-white text-center text-xl font-bold text-emerald-900 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
            ))}
          </div>

          {isLoading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={24} />
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            {t("expires", { minutes: Math.ceil(resendTimer / 60) })}
          </div>

          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="mt-4 w-full text-center text-sm font-medium text-emerald-600 hover:underline disabled:text-gray-400 disabled:hover:no-underline"
          >
            {t("resend")}
            {resendTimer > 0 && ` (${resendTimer}s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
