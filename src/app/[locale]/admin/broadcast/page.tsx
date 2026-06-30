"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Send, Mail, MessageSquare, Bell, Users, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  { id: 1, name: "التحليل الرياضي", students: 320 },
  { id: 2, name: "الفيزياء العامة", students: 280 },
  { id: 3, name: "مقدمة في البرمجة", students: 450 },
  { id: 4, name: "الاقتصاد الكلي", students: 190 },
];

export default function AdminBroadcastPage() {
  const t = useTranslations("admin.broadcast");
  const tc = useTranslations("common");
  const [recipients, setRecipients] = useState<"all" | "group">("all");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState({ email: true, sms: false, inapp: true });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async () => {
    if (!subject || !message) return;
    setIsSending(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSending(false);
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("description")}</p>
      </div>

      {isSent && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle size={20} className="text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{t("sentSuccess")}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Recipients */}
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold text-emerald-900">{t("to")}</h3>
            <div className="flex gap-3">
              <button onClick={() => setRecipients("all")}
                className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-colors",
                  recipients === "all" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-ivory-300 hover:border-emerald-300"
                )}>
                <Users size={20} />
                <div className="text-center">
                  <p className="text-sm font-medium">{t("all")}</p>
                  <p className="text-[10px] text-gray-500">12,450 {t("student")}</p>
                </div>
              </button>
              <button onClick={() => setRecipients("group")}
                className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-colors",
                  recipients === "group" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-ivory-300 hover:border-emerald-300"
                )}>
                <Users size={20} />
                <div className="text-center">
                  <p className="text-sm font-medium">{t("group")}</p>
                  <p className="text-[10px] text-gray-500">{t("group")}</p>
                </div>
              </button>
            </div>

            {recipients === "group" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {groups.map((group) => (
                  <button key={group.id} onClick={() => setSelectedGroup(group.id)}
                    className={cn("rounded-lg border p-3 text-right transition-colors",
                      selectedGroup === group.id ? "border-emerald-600 bg-emerald-50" : "border-ivory-300 hover:border-emerald-300"
                    )}>
                    <p className="text-sm font-medium text-emerald-900">{group.name}</p>
                    <p className="text-[10px] text-gray-500">{group.students} {t("student")}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject & Message */}
          <div className="card">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("subject")}</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="input-field" placeholder={t("subjectPlaceholder")} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("message")}</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  className="input-field min-h-[150px] resize-none" placeholder={t("messagePlaceholder")} />
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold text-emerald-900">{t("channels")}</h3>
            <div className="space-y-3">
              {[
                { key: "email", icon: Mail, label: t("emailChannel"), desc: t("emailDesc") },
                { key: "sms", icon: MessageSquare, label: t("smsChannel"), desc: t("smsDesc") },
                { key: "inapp", icon: Bell, label: t("appChannel"), desc: t("appDesc") },
              ].map((ch) => {
                const Icon = ch.icon;
                return (
                  <label key={ch.key} className="flex cursor-pointer items-center justify-between rounded-lg border border-ivory-300 p-3 transition-colors hover:border-emerald-300">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{ch.label}</p>
                        <p className="text-[10px] text-gray-400">{ch.desc}</p>
                      </div>
                    </div>
                    <input type="checkbox" checked={(channels as any)[ch.key]}
                      onChange={(e) => setChannels({ ...channels, [ch.key]: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h3 className="mb-4 text-sm font-semibold text-emerald-900">{t("preview")}</h3>
            <div className="rounded-xl border border-ivory-300 bg-ivory-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">E</div>
                <span className="text-xs font-semibold text-emerald-900">EQUINOX</span>
              </div>
              <p className="mb-2 text-sm font-semibold text-emerald-900">{subject || t("previewTitle")}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{message || t("previewBody")}</p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
                {channels.email && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-600">{t("emailLabel")}</span>}
                {channels.sms && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-600">SMS</span>}
                {channels.inapp && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-purple-600">{t("appLabel")}</span>}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-ivory-50 p-3 text-center text-xs text-gray-500">
              {recipients === "all" ? (
                <>{t("willReachAll")} <span className="font-bold text-emerald-900">12,450</span> {t("student")}</>
              ) : selectedGroup ? (
                <>{t("willReachGroup")} <span className="font-bold text-emerald-900">{groups.find(g => g.id === selectedGroup)?.students}</span> {t("student")} — {groups.find(g => g.id === selectedGroup)?.name}</>
              ) : (
                t("selectGroup")
              )}
            </div>

            <button onClick={handleSend} disabled={!subject || !message || isSending}
              className="btn-primary mt-4 w-full">
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {t("send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
