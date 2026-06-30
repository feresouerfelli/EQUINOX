"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { Globe, Bell, Shield, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { key: "language", icon: Globe },
  { key: "notifications", icon: Bell },
  { key: "security", icon: Shield },
  { key: "appearance", icon: Palette },
];

const languages = [
  { code: "ar" as const, label: "العربية", flag: "🇹🇳" },
  { code: "fr" as const, label: "Français", flag: "🇫🇷" },
  { code: "en" as const, label: "English", flag: "🇬🇧" },
];

export default function SettingsPage() {
  const t = useTranslations("common");
  const ts = useTranslations("student.settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("language");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [appNotif, setAppNotif] = useState(true);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <h1 className="text-2xl font-bold text-emerald-900">{t("settings")}</h1>

      <div className="flex gap-6">
        <div className="hidden w-48 shrink-0 lg:block">
          <div className="card p-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    activeSection === section.key
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 hover:bg-ivory-100"
                  )}
                >
                  <Icon size={16} />
                  {t(section.key)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <div className="card">
            {activeSection === "language" && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("language")}</h2>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <label
                      key={lang.code}
                      onClick={() => {
                        if (lang.code !== locale) {
                          router.push(pathname, { locale: lang.code });
                        }
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                        locale === lang.code
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-ivory-300 hover:border-emerald-500"
                      )}
                    >
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        locale === lang.code ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                      )}>
                        {locale === lang.code && <Check size={10} className="text-white" />}
                      </div>
                      <span>{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-700">{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("notifications")}</h2>
                <div className="space-y-4">
                  {[
                    { label: ts("emailNotifications"), checked: emailNotif, onChange: setEmailNotif },
                    { label: ts("smsNotifications"), checked: smsNotif, onChange: setSmsNotif },
                    { label: ts("appNotifications"), checked: appNotif, onChange: setAppNotif },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-ivory-300 p-3">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => item.onChange(!item.checked)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                          item.checked ? "bg-emerald-600" : "bg-gray-200"
                        )}
                      >
                        <span className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                          item.checked ? "translate-x-5" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-emerald-900">{ts("security")}</h2>
                <p className="text-sm text-gray-500">{ts("passwordDesc")}</p>
              </div>
            )}

            {activeSection === "appearance" && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-emerald-900">{ts("appearance")}</h2>
                <p className="text-sm text-gray-500">{ts("appearanceDesc")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
