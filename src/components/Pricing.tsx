"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = ["free", "premium", "enterprise"];

export default function Pricing() {
  const t = useTranslations("pricing");
  const router = useRouter();

  return (
    <section className="bg-ivory-100 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isPremium = plan === "premium";
            return (
              <div
                key={plan}
                className={cn(
                  "card relative overflow-hidden",
                  isPremium && "border-gold-500 ring-2 ring-gold-500/20"
                )}
              >
                {isPremium && (
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-gold-500 px-3 py-1 text-xs font-bold text-dark-200">
                    {t(`${plan}.badge`)}
                  </div>
                )}

                <h3 className="text-xl font-bold text-emerald-900">
                  {t(`${plan}.name`)}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  {plan !== "enterprise" && (
                    <span className="text-4xl font-extrabold text-emerald-900">
                      {t(`${plan}.price`)}
                    </span>
                  )}
                  {plan !== "enterprise" && (
                    <span className="text-sm text-gray-500">
                      {t(`common.dt`)} {t(`${plan}.period`)}
                    </span>
                  )}
                  {plan === "enterprise" && (
                    <span className="text-4xl font-extrabold text-emerald-900">
                      {t(`${plan}.price`)}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {t(`${plan}.description`)}
                </p>

                <ul className="mt-6 space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                    const feature = t(`${plan}.features.${i - 1}`);
                    if (!feature) return null;
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <Check
                          size={16}
                          className={cn(
                            "mt-0.5 shrink-0",
                            isPremium ? "text-gold-500" : "text-emerald-600"
                          )}
                        />
                        {feature}
                      </li>
                    );
                  })}
                </ul>

                <button
                  onClick={() => router.push("/register")}
                  className={cn(
                    "mt-8 w-full",
                    isPremium ? "btn-primary" : "btn-secondary"
                  )}
                >
                  {t(`${plan}.cta`)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
