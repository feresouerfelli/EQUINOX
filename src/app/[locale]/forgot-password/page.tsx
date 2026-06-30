"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const schema = z.object({
    phone: z.string().min(8, " "),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setIsSent(true);
      setTimeout(() => router.push("/reset-password"), 2000);
    } catch {
    } finally {
      setIsLoading(false);
    }
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
          {isSent ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-sm text-gray-600">
                {t("otpSentToPhone")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("phoneNumber")}
                </label>
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border border-r-0 border-ivory-300 bg-ivory-50 px-3 text-sm text-gray-500">
                    +216
                  </span>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="input-field !rounded-l-none"
                    placeholder="12345678"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  t("submit")
                )}
              </button>
            </form>
          )}

          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-medium text-emerald-600 hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
