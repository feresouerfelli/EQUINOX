"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Send, Clock } from "lucide-react";

const threads = [
  { id: 1, author: "أحمد بن علي", title: "سؤال في التكامل", replies: 12, lastActivity: "منذ 2 ساعة", tags: ["تحليل", "سؤال"] },
  { id: 2, author: "سارة المحمدي", title: "مراجعة Binary Search", replies: 8, lastActivity: "منذ 5 ساعة", tags: ["هياكل بيانات"] },
  { id: 3, author: "محمد الصالح", title: "SQL vs NoSQL", replies: 25, lastActivity: "أمس", tags: ["قواعد بيانات", "نقاش"] },
  { id: 4, author: "نور العتيبي", title: "نصائح للامتحان", replies: 31, lastActivity: "منذ يومين", tags: ["نصائح"] },
];

export default function StudentForumPage() {
  const t = useTranslations("forum");
  const td = useTranslations("dashboard");
  const [replying, setReplying] = useState<number | null>(null);
  const [reply, setReply] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E8F5E0]">{td("forum")}</h2>
        <button className="btn-primary !py-2 !text-xs">+ {t("newPost")}</button>
      </div>

      <div className="space-y-3">
        {threads.map((thread, i) => (
          <div key={thread.id} className="dash-card-flat fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#E8F5E0]">{thread.title}</p>
                <p className="mt-1 text-xs text-[#4D7A60]">{thread.author} · {thread.lastActivity}</p>
                <div className="mt-2 flex gap-2">
                  {thread.tags.map((tag, j) => (
                    <span key={j} className="badge-green">{tag}</span>
                  ))}
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs text-[#9DBFAA]">
                <MessageSquare size={12} /> {thread.replies}
              </span>
            </div>
            {replying === thread.id && (
              <div className="mt-3 flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t("replyPlaceholder")} className="input-dark !py-2 flex-1" />
                <button onClick={() => { setReplying(null); setReply(""); }} className="btn-primary !px-3 !py-2 !text-xs"><Send size={12} /></button>
              </div>
            )}
            {replying !== thread.id && (
              <button onClick={() => setReplying(thread.id)} className="mt-3 btn-ghost !px-3 !py-1.5 !text-xs">
                {t("replyNow")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
