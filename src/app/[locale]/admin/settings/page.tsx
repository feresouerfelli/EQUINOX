"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { Settings, Shield, Globe, Bell, Check, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "ar" as const, label: "العربية", flag: "🇹🇳" },
  { code: "fr" as const, label: "Français", flag: "🇫🇷" },
  { code: "en" as const, label: "English", flag: "🇬🇧" },
];

const tabs = [
  { key: "platform", icon: Settings },
  { key: "security", icon: Shield },
  { key: "languages", icon: Globe },
  { key: "emailNotifications", icon: Bell },
];

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("platform");
  const [platformName, setPlatformName] = useState("EQUINOX");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [appNotif, setAppNotif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 !text-xs">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? tc("loading") : saved ? tc("saved") : tc("save")}
        </button>
      </div>

      <div className="flex gap-2 lg:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors", activeTab === tab.key ? "bg-[#0A6B4A] text-[#E8F5E0]" : "bg-[#142918] text-[#4D7A60]")}>
              <Icon size={16} />
              {t(tab.key)}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        <div className="hidden w-48 shrink-0 lg:block">
          <div className="bg-[#0F1F15] border border-[rgba(255,255,255,0.07)] rounded-xl p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === tab.key ? "bg-[#0A6B4A]/20 text-[#E8F5E0]" : "text-[#4D7A60] hover:text-[#9DBFAA]")}>
                  <Icon size={16} /> {t(tab.key)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "platform" && (
            <div className="dash-card-flat fade-up">
              <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("platform")}</h3>
              <p className="mb-4 text-xs text-[#4D7A60]">{t("platformDesc")}</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-[#4D7A60]">{tc("platformName")}</label>
                  <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="input-dark" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="dash-card-flat fade-up">
              <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("security")}</h3>
              <p className="text-xs text-[#4D7A60]">{t("securityDesc")}</p>
            </div>
          )}

          {activeTab === "languages" && (
            <div className="dash-card-flat fade-up">
              <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("languages")}</h3>
              <p className="mb-4 text-xs text-[#4D7A60]">{t("languagesDesc")}</p>
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
                        ? "border-[#0A6B4A] bg-[#0A6B4A]/10"
                        : "border-[rgba(255,255,255,0.07)] hover:border-[#0A6B4A]"
                    )}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      locale === lang.code ? "border-[#0A6B4A] bg-[#0A6B4A]" : "border-[#4D7A60]"
                    )}>
                      {locale === lang.code && <Check size={10} className="text-white" />}
                    </div>
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium text-[#E8F5E0]">{lang.label}</span>
                    <span className={cn("ml-auto text-xs", locale === lang.code ? "text-[#0A6B4A]" : "text-[#4D7A60]")}>
                      {locale === lang.code ? tc("default") : ""}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "emailNotifications" && (
            <div className="dash-card-flat fade-up">
              <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("emailNotifications")}</h3>
              <p className="mb-4 text-xs text-[#4D7A60]">{t("emailNotificationsDesc")}</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-[#4D7A60]">SMTP Host</label>
                  <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.example.com" className="input-dark" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#4D7A60]">SMTP Port</label>
                  <input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="input-dark" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Email", checked: emailNotif, onChange: setEmailNotif },
                    { label: "SMS", checked: smsNotif, onChange: setSmsNotif },
                    { label: tc("notifications"), checked: appNotif, onChange: setAppNotif },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.07)] p-3">
                      <span className="text-sm text-[#E8F5E0]">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => item.onChange(!item.checked)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                          item.checked ? "bg-[#0A6B4A]" : "bg-[#142918]"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
