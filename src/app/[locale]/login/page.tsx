"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);

  const schema = z.object({
    emailOrPhone: z.string().min(1, " "),
    password: z.string().min(1, " "),
    rememberMe: z.boolean().optional(),
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
      const res = await api.post<{ user: any; token: string }>("/auth/login", {
        email_or_phone: data.emailOrPhone,
        password: data.password,
      });

      login(
        {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || "",
          role: res.user.role,
          avatar_url: res.user.avatar_url || null,
          lang: res.user.lang || "ar",
          is_active: res.user.is_active ?? true,
        },
        res.token
      );

      const roleRedirect: Record<string, string> = {
        admin: "/admin",
        professor: "/professor",
        student: "/dashboard",
      };
      router.push(roleRedirect[res.user.role] || "/dashboard");
    } catch (e: any) {
      setError(e.message || "حدث خطأ أثناء تسجيل الدخول");
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
            مرحباً بعودتك إلى رحلة التفوق
          </p>
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
                {t("emailOrPhone")}
              </label>
              <input
                {...register("emailOrPhone")}
                className="input-field"
                placeholder="ahmed@university.tn / 12345678"
              />
              {errors.emailOrPhone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.emailOrPhone.message}
                </p>
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
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                {t("rememberMe")}
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>

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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ivory-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-400">{t("or")}</span>
            </div>
          </div>

          <button className="btn-secondary w-full">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:underline"
            >
              {t("registerLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
