"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Star, Users, BookOpen, Eye, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function AdminProfessorsPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const token = useAuthStore((s) => s.token);
  const [professors, setProfessors] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", specialty: "" });

  useEffect(() => {
    if (!token) return;
    api.get<any>("/admin/users?role=professor", token)
      .then((data) => setProfessors(data.data || []))
      .catch(() => {});
  }, [token]);

  const handleAdd = async () => {
    if (!token) return;
    await api.post("/admin/professors", form, token);
    setShowAdd(false);
    setForm({ name: "", email: "", specialty: "" });
    // refresh
    api.get<any>("/admin/users?role=professor", token).then((data) => setProfessors(data.data || [])).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("users.title")}</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> {t("users.addNewProfessor")}
        </button>
      </div>

      {showAdd && (
        <div className="dash-card-flat fade-up">
          <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("users.addProfessor")}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={tc("name")} className="input-dark" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={tc("email")} className="input-dark" />
            <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder={tc("specialty")} className="input-dark" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleAdd} className="btn-primary !px-4 !py-2">{tc("save")}</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost !px-4 !py-2">{tc("cancel")}</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professors.map((prof, i) => (
          <div key={prof.id || i} className="dash-card fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6B4A] text-lg font-bold text-[#E8F5E0]">
                {prof.name?.[0] || "P"}
              </div>
              <div>
                <p className="font-semibold text-[#E8F5E0]">{prof.name}</p>
                <p className="text-xs text-[#4D7A60]">{prof.email}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-[#9DBFAA]">
              <span className="flex items-center gap-1"><Users size={12} /> -- {tc("student")}</span>
              <span className="flex items-center gap-1"><BookOpen size={12} /> -- {tc("lesson")}</span>
              <span className="flex items-center gap-1"><Star size={12} className="text-[#C9A84C]" /> --</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost !px-3 !py-1.5 !text-xs"><Eye size={14} /> {tc("view")}</button>
              <button className="btn-ghost !px-3 !py-1.5 !text-xs"><Edit size={14} /> {tc("edit")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
