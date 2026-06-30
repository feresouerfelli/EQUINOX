"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Rocket } from "lucide-react";

export default function FinalCTA() {
  const t = useTranslations("cta");
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-dark-200 py-20">
      <div className="orb orb-gold absolute -right-20 -top-20 h-40 w-40 opacity-20" />
      <div className="orb orb-emerald absolute -bottom-20 -left-20 h-40 w-40 opacity-20" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
        <h2 className="shimmer-text mb-4 text-3xl font-extrabold md:text-5xl">
          {t("title")}
        </h2>
        <p className="mb-8 text-lg text-gray-400">{t("subtitle")}</p>
        <button
          onClick={() => router.push("/register")}
          className="btn-primary animate-gold-glow group gap-3 px-10 py-4 text-base"
        >
          {t("button")}
          <Rocket
            size={18}
            className="transition-transform group-hover:translate-y-[-2px]"
          />
        </button>
      </div>
    </section>
  );
}
