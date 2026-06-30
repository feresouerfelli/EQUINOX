"use client";

import { useTranslations } from "next-intl";
import {
  Play,
  Video,
  FileText,
  BarChart3,
  MessageSquare,
  Brain,
  Sparkles,
} from "lucide-react";

const featureIcons = [
  Video,
  Play,
  FileText,
  BarChart3,
  MessageSquare,
  Brain,
];

export default function Features() {
  const t = useTranslations("features");
  const featureKeys = ["video", "live", "exercises", "progress", "forum", "pdf"];

  return (
    <section className="bg-ivory-100 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i];
            return (
              <div
                key={key}
                className="group card cursor-pointer border-emerald-800/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon className="icon-hover" size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-emerald-900">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 card-dark group cursor-pointer border-emerald-800">
          <div className="flex flex-col items-center gap-6 lg:flex-row">
            <div className="flex-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gold-500 text-dark-200">
                <Sparkles className="icon-hover" size={24} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">
                {t("items.ai.title")}
              </h3>
              <p className="text-gray-400">
                {t("items.ai.description")}
              </p>
            </div>
            <div className="w-full flex-1 rounded-xl border border-emerald-700 bg-dark-300 p-6 font-mono text-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="text-gray-500">
                <span className="text-gold-500">AI&gt;</span> اشرح لي مفهوم
                التفاضل والتكامل في الرياضيات
              </div>
              <div className="mt-2 text-gray-400">
                <span className="text-emerald-400">响应&gt;</span> التفاضل
                هو عملية حساب معدل التغير اللحظي...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
