"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tc = useTranslations("common");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const schema = z
    .object({
      name: z.string().min(2, " "),
      email: z.string().email(" "),
      phone: z.string().min(8, " "),
      password: z.string().min(8, " "),
      confirmPassword: z.string(),
      agreeTerms: z.literal(true, {
        errorMap: () => ({ message: " " }),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: " ",
      path: ["confirmPassword"],
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
    setError("");
    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: "+216" + data.phone,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
      router.push("/otp-verify?phone=" + encodeURIComponent("+216" + data.phone));
    } catch (e: any) {
      setError(e.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 lg:flex lg:items-center lg:justify-center bg-emerald-600 relative overflow-hidden">
        <div className="grid-overlay absolute inset-0 opacity-30" />
        <div className="orb orb-gold absolute top-20 right-20 h-32 w-32 opacity-40" />
        <div className="orb orb-emerald absolute bottom-20 left-20 h-40 w-40 opacity-30" />

        <div className="relative z-10 px-12 text-center">
          <img src="/images/logo.svg" alt="EQUINOX" className="h-28 mx-auto mb-4" />
          <h2 className="mb-4 text-3xl font-bold text-[#C9A84C]" style={{ fontFamily: "Georgia, serif" }}>EQUINOX</h2>
          <p className="text-lg text-emerald-100">
            المنصة الجامعية التونسية للتعلم الإلكتروني
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-emerald-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-500">12K+</div>
              <div className="text-xs">طالب</div>
            </div>
            <div className="h-8 w-px bg-emerald-400/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-500">150+</div>
              <div className="text-xs">مقرر</div>
            </div>
            <div className="h-8 w-px bg-emerald-400/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-500">4.8</div>
              <div className="text-xs">تقييم</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600"
            >
              <img src="/images/logo.svg" alt="EQUINOX" className="h-12" />
            </Link>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-emerald-900">
            {t("title")}
          </h1>
          <p className="mb-8 text-sm text-gray-500">{t("subtitle")}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("fullName")}
              </label>
              <input
                {...register("name")}
                className="input-field"
                placeholder="Ahmed Ben Ali"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <input
                {...register("email")}
                type="email"
                className="input-field"
                placeholder="ahmed@university.tn"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("phone")}
              </label>
              <div className="flex">
                <span className="flex items-center rounded-l-lg border border-r-0 border-ivory-300 bg-ivory-50 px-3 text-sm text-gray-500">
                  +216
                </span>
                <input
                  {...register("phone")}
                  type="tel"
                  className="input-field !rounded-l-none"
                  placeholder={t("phonePlaceholder")}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="input-field !pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("confirmPassword")}
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="input-field"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                {...register("agreeTerms")}
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                {t("agreeTerms")}
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-xs text-red-500">{errors.agreeTerms.message}</p>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

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

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-medium text-emerald-600 hover:underline">
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
