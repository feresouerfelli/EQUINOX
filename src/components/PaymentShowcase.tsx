"use client";

import { useTranslations } from "next-intl";
import { Smartphone, CreditCard, QrCode, Building2, BadgeCheck } from "lucide-react";

const methods = ["d17", "konnect", "flouci", "bank"];
const icons = [Smartphone, CreditCard, QrCode, Building2];

export default function PaymentShowcase() {
  const t = useTranslations("payments");

  return (
    <section className="bg-dark-200 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="section-title text-white">{t("title")}</h2>
          <p className="section-subtitle text-gray-400">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((method, i) => {
            const Icon = icons[i];
            const isD17 = method === "d17";
            return (
              <div
                key={method}
                className={`card-dark group relative cursor-pointer ${
                  isD17 ? "border-gold-500 ring-1 ring-gold-500/30" : "border-emerald-700"
                }`}
              >
                {isD17 && (
                  <div className="badge-gold absolute right-3 top-3">
                    <BadgeCheck size={12} />
                    {t(`${method}.badge`)}
                  </div>
                )}

                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                    isD17
                      ? "bg-gold-500/20 text-gold-500 group-hover:bg-gold-500 group-hover:text-dark-200"
                      : "bg-emerald-800 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white"
                  }`}
                >
                  <Icon className="icon-hover" size={28} />
                </div>

                <h3 className="text-lg font-bold text-white">
                  {t(`${method}.name`)}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {t(`${method}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
