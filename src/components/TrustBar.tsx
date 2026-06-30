"use client";

import { useTranslations } from "next-intl";

const partners = [
  "جامعة تونس 1",
  "جامعة منوبة",
  "المعهد العالي للعلوم التطبيقية",
  "جامعة القيروان",
  "جامعة صفاقس",
  "المعهد الوطني العالي للفنون الجميلة",
];

export default function TrustBar() {
  const t = useTranslations("trust");

  return (
    <section className="border-b border-ivory-300 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium text-gray-500">
          {t("title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((name, i) => (
            <div
              key={i}
              className="flex h-12 items-center rounded-lg bg-ivory-100 px-6 text-sm font-medium text-gray-400 transition-colors hover:text-emerald-600"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
