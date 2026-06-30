"use client";

import { useState, useEffect } from "react";
import { Save, Shield, Globe, Loader2, Check } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const languages = [
  { code: "ar" as const, label: "العربية", flag: "🇹🇳" },
  { code: "fr" as const, label: "Français", flag: "🇫🇷" },
  { code: "en" as const, label: "English", flag: "🇬🇧" },
];

export default function ProfessorSettingsPage() {
  const t = useTranslations("professor.settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "language">("profile");
  const [form, setForm] = useState({ name: "", email: "", phone: "", bio: "", specialty: "" });

  useEffect(() => {
    if (!token) return;
    api.get<{ user: { name: string; email: string; phone: string }; professor: { bio_ar: string | null; specialty: string | null } | null }>("/professor/profile", token)
      .then((data) => setForm({
        name: data.user.name || "", email: data.user.email || "", phone: data.user.phone || "",
        bio: data.professor?.bio_ar || "", specialty: data.professor?.specialty || "",
      }))
      .catch(() => {});
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/professor/profile", { name: form.name, bio_ar: form.bio, specialty: form.specialty }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
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
        <button onClick={() => setActiveTab("profile")} className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors", activeTab === "profile" ? "bg-[#0A6B4A] text-[#E8F5E0]" : "bg-[#142918] text-[#4D7A60]")}>{t("profile")}</button>
        <button onClick={() => setActiveTab("language")} className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors", activeTab === "language" ? "bg-[#0A6B4A] text-[#E8F5E0]" : "bg-[#142918] text-[#4D7A60]")}>{tc("language")}</button>
      </div>

      <div className="flex gap-6">
        <div className="hidden w-48 shrink-0 lg:block">
          <div className="bg-[#0F1F15] border border-[rgba(255,255,255,0.07)] rounded-xl p-2">
            <button onClick={() => setActiveTab("profile")} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === "profile" ? "bg-[#0A6B4A]/20 text-[#E8F5E0]" : "text-[#4D7A60] hover:text-[#9DBFAA]")}>
              <Shield size={16} /> {t("profile")}
            </button>
            <button onClick={() => setActiveTab("language")} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === "language" ? "bg-[#0A6B4A]/20 text-[#E8F5E0]" : "text-[#4D7A60] hover:text-[#9DBFAA]")}>
              <Globe size={16} /> {tc("language")}
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="dash-card-flat fade-up">
              <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("profile")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-[#4D7A60]">{t("name")}</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#4D7A60]">{t("email")}</label>
                  <input value={form.email} disabled className="input-dark opacity-60 cursor-not-allowed" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#4D7A60]">{t("specialty")}</label>
                  <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#4D7A60]">{t("phone")}</label>
                  <input value={form.phone} disabled className="input-dark opacity-60 cursor-not-allowed" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-[#4D7A60]">{t("bio")}</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-dark min-h-[80px] resize-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className="dash-card-flat fade-up">
              <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{tc("language")}</h3>
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
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
