"use client";

import { useState } from "react";
import { HelpCircle, Send, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

const mockQuestions = [
  { id: 1, student: "أحمد بن علي", course: "التحليل الرياضي", chapter: "الفصل 5", text: "كيف أحسب التكاملالجزئي للدالة f(x,y) = x²y؟", time: "منذ 2 ساعة" },
  { id: 2, student: "سارة المحمدي", course: "هياكل البيانات", chapter: "Binary Trees", text: "ما الفرق بين BST و AVL Tree؟", time: "منذ 5 ساعة" },
  { id: 3, student: "محمد الصالح", course: "قواعد البيانات", chapter: "SQL", text: "كيف أكتب query للبحث عن أعلى 3 رواتب؟", time: "منذ يوم" },
];

export default function ProfessorQuestionsPage() {
  const t = useTranslations("professor.questions");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [answered, setAnswered] = useState<Set<number>>(new Set());

  const handleReply = (id: number) => {
    setAnswered((prev) => new Set(Array.from(prev).concat(id)));
    setReplyingTo(null);
    setReply("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>
      <div className="space-y-3">
        {mockQuestions.map((q, i) => (
          <div key={q.id} className="dash-card-flat fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C]/20 text-xs font-bold text-[#C9A84C]">
                  {q.student[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#E8F5E0]">{q.student}</p>
                  <p className="text-xs text-[#4D7A60]">{q.course} — {q.chapter}</p>
                  <p className="mt-2 text-sm text-[#9DBFAA]">{q.text}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-[#4D7A60]"><Clock size={10} /> {q.time}</span>
            </div>

            {answered.has(q.id) ? (
              <div className="mt-3 rounded-lg border border-[#34D399]/20 bg-[#34D399]/5 p-3 text-xs text-[#34D399]">
                {t("replied")}
              </div>
            ) : replyingTo === q.id ? (
              <div className="mt-3 flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t("replyPlaceholder")} className="input-dark !py-2 flex-1" />
                <button onClick={() => handleReply(q.id)} className="btn-primary !px-3 !py-2 !text-xs"><Send size={12} /></button>
              </div>
            ) : (
              <button onClick={() => setReplyingTo(q.id)} className="mt-3 btn-ghost !px-3 !py-1.5 !text-xs">
                <HelpCircle size={12} /> {t("replyNow")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
