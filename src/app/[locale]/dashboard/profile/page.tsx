"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { User, Save, Shield, BookOpen, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function StudentProfilePage() {
  const t = useTranslations("student.profile");
  const tc = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "", phone: "",
    university: "", specialty: "", year: "2",
  });

  const handleSave = () => { setSaving(true); setTimeout(() => setSaving(false), 1200); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 !text-xs">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> {tc("save")}</>}
        </button>
      </div>

      <div className="dash-card-flat fade-up">
        <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("personalInfo")}</h3>
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
            <label className="mb-1 block text-xs text-[#4D7A60]">{t("phone")}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-dark" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#4D7A60]">{t("year")}</label>
            <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-dark">
              <option value="1">{t("yearFirst")}</option>
              <option value="2">{t("yearSecond")}</option>
              <option value="3">{t("yearThird")}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#4D7A60]">{t("university")}</label>
            <input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} className="input-dark" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#4D7A60]">{t("specialty")}</label>
            <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="input-dark" />
          </div>
        </div>
      </div>

      <div className="dash-card-flat fade-up stagger-2">
        <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("stats")}</h3>
        <div className="grid gap-3 grid-cols-3">
          {[
            { label: t("coursesCount"), value: "6", icon: BookOpen, color: "text-[#0A6B4A]" },
            { label: t("certificates"), value: "2", icon: Shield, color: "text-[#C9A84C]" },
            { label: t("points"), value: "1,250", icon: User, color: "text-[#A855F7]" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 text-center">
                <Icon size={20} className={`mx-auto mb-2 ${s.color}`} />
                <p className="text-lg font-bold text-[#E8F5E0]">{s.value}</p>
                <p className="text-[10px] text-[#4D7A60]">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
