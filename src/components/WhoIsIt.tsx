"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, BookOpen, Building2 } from "lucide-react";

const roles = ["students", "professors", "institutions"];
const icons = [GraduationCap, BookOpen, Building2];

export default function WhoIsIt() {
  const t = useTranslations("whoIsIt");

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, i) => {
            const Icon = icons[i];
            return (
              <div key={role} className="group card text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon className="icon-hover" size={32} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-emerald-900">
                  {t(`${role}.title`)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(`${role}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
