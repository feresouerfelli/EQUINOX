"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Star, Zap, Crown, ArrowRight } from "lucide-react";

export default function StudentSubscriptionPage() {
  const t = useTranslations("student.subscription");
  const tc = useTranslations("common");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: t("plans.free.name"),
      price: "0",
      period: t("perMonth"),
      features: t.raw("plans.free.features") as string[],
      icon: Star,
      color: "border-[#4D7A60]/30",
      btn: "btn-ghost",
      current: true,
    },
    {
      name: t("plans.pro.name"),
      price: "49",
      period: t("perMonth"),
      features: t.raw("plans.pro.features") as string[],
      icon: Zap,
      color: "border-[#0A6B4A]/50 bg-[#0A6B4A]/5",
      btn: "btn-primary",
    },
    {
      name: t("plans.university.name"),
      price: "99",
      period: t("perMonth"),
      features: t.raw("plans.university.features") as string[],
      icon: Crown,
      color: "border-[#C9A84C]/50 bg-[#C9A84C]/5",
      btn: "btn-gold",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>

      <div className="flex justify-center gap-2">
        {(["monthly", "yearly"] as const).map((b) => (
          <button key={b} onClick={() => setBilling(b)}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              billing === b ? "bg-[#0A6B4A] text-white" : "bg-[rgba(255,255,255,0.05)] text-[#9DBFAA]"
            }`}>
            {b === "monthly" ? t("monthly") : t("yearly")}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((p, i) => {
          const Icon = p.icon;
          const price = billing === "yearly" ? Math.round(Number(p.price) * 0.8) : p.price;
          return (
            <div key={i} className={`rounded-xl border p-5 transition-all hover:translate-y-[-2px] ${p.color}`}>
              {p.current && <span className="mb-3 inline-block badge-green">{t("currentPlan")}</span>}
              <Icon size={28} className={i === 1 ? "text-[#0A6B4A]" : i === 2 ? "text-[#C9A84C]" : "text-[#4D7A60]"} />
              <h3 className="mt-3 text-lg font-bold text-[#E8F5E0]">{p.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#E8F5E0]">{price}</span>
                <span className="text-xs text-[#4D7A60]">{tc("dt")}{p.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-[#9DBFAA]">
                    <Check size={14} className="text-[#34D399]" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`${p.btn} mt-4 w-full !py-2 !text-xs`}>
                {p.current ? t("currentPlan") : <span className="flex items-center justify-center gap-1">{t("subscribeNow")} <ArrowRight size={12} /></span>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
