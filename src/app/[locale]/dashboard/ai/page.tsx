"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send, HelpCircle, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Link } from "@/i18n/navigation";

export default function StudentAIPage() {
  const t = useTranslations("aiNotebook");
  const token = useAuthStore((s) => s.token);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "quiz" | "search">("chat");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);

  useEffect(() => {
    if (!token) return;
    setFetchingCourses(true);
    api.get<any[]>("/student/courses", token)
      .then((data) => {
        setCourses(data);
        if (data.length > 0) {
          const firstCourse = data[0].course;
          if (firstCourse) {
            setSelectedCourseId(firstCourse.id);
          }
        }
      })
      .catch((e) => {
        console.error("Failed to load courses:", e);
      })
      .finally(() => {
        setFetchingCourses(false);
      });
  }, [token]);

  const handleSend = async () => {
    if (!message.trim() || loading || !token) return;
    const userMsg = message.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      let data: any;

      if (mode === "chat") {
        if (!selectedCourseId) {
          throw new Error(t("selectCourseFirst"));
        }
        data = await api.post<any>("/ai/chat", {
          course_id: selectedCourseId,
          message: userMsg,
        }, token);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.message || t("noAnswer") }
        ]);
      } else if (mode === "quiz") {
        if (!selectedCourseId) {
          throw new Error(t("selectCourseFirst"));
        }
        data = await api.post<any>("/ai/quiz", {
          course_id: selectedCourseId,
          topic: userMsg,
          count: 3,
        }, token);

        let responseText = "";
        if (Array.isArray(data.questions)) {
          responseText = data.questions.map((q: any, qi: number) => {
            return `Q${qi + 1}: ${q.question}\n` +
              q.options.map((opt: string) => `• ${opt}`).join("\n") +
              `\n\n${t("correctAnswer")}: ${q.options[q.correct] || q.correct}\n${t("explanation")}: ${q.explanation}\n`;
          }).join("\n---\n\n");
        } else {
          responseText = t("quizError");
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: responseText }
        ]);
      } else if (mode === "search") {
        data = await api.post<any>("/ai/search", {
          query: userMsg,
        }, token);

        let responseText = `${data.summary || t("noSummary")}\n\n`;
        if (Array.isArray(data.articles) && data.articles.length > 0) {
          responseText += `${t("relatedArticles")}\n` +
            data.articles.map((art: any) => `• [${art.title}](${art.url})`).join("\n");
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: responseText }
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `${t("error")}: ${e.message || t("unexpectedError")}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCourses) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A84C]" size={32} />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 dash-card-flat border-[#C9A84C]/20 bg-gradient-to-b from-[#142918] to-[#081810]">
        <BookOpen size={48} className="text-[#C9A84C] mb-4" />
        <h3 className="text-lg font-bold text-[#E8F5E0] mb-2">{t("noCourses")}</h3>
        <p className="text-sm text-[#9DBFAA] max-w-sm mb-6">
          {t("noCoursesDesc")}
        </p>
        <Link href="/courses" className="btn-primary">
          {t("browseCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
          {(["chat", "quiz", "search"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                mode === m
                  ? "bg-[#0A6B4A] text-white shadow-lg"
                  : "bg-[rgba(255,255,255,0.05)] text-[#9DBFAA] hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              {m === "chat" ? `💬 ${t("chat")}` : m === "quiz" ? `📝 ${t("quiz")}` : `🔍 ${t("wikiSearch")}`}
            </button>
          ))}
        </div>

        {/* Course Dropdown Selector */}
        {mode !== "search" && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#4D7A60] font-medium">{t("activeCourse")}</label>
            <select
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="bg-[#0F1F15] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-1.5 text-xs text-[#E8F5E0] focus:ring-1 focus:ring-[#C9A84C] focus:outline-none"
            >
              {courses.map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;
                return (
                  <option key={course.id} value={course.id}>
                    {course.title_ar || course.title_fr}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4 flex flex-col justify-between">
        <div className="flex-1 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C9A84C]/20 mb-4">
                <HelpCircle size={32} className="text-[#C9A84C]" />
              </div>
              <h3 className="font-semibold text-[#E8F5E0] text-base">AI Notebook</h3>
              <p className="mt-1 text-xs text-[#4D7A60] max-w-xs">
                {mode === "chat"
                  ? t("chatDesc")
                  : mode === "quiz"
                  ? t("quizDesc")
                  : t("wikiDesc")}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-[#0A6B4A] text-white rounded-br-none"
                      : "bg-[rgba(255,255,255,0.05)] text-[#E8F5E0] border border-[rgba(255,255,255,0.03)] rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#C9A84C] font-medium bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-lg p-3 w-fit animate-pulse">
              <Loader2 size={14} className="animate-spin" /> {t("thinkingAI")}
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            mode === "chat"
              ? t("chatPlaceholderInput")
              : mode === "quiz"
              ? t("quizPlaceholderInput")
              : t("wikiPlaceholderInput")
          }
          className="input-dark flex-1 px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0F1F15] text-[#E8F5E0] text-sm focus:ring-1 focus:ring-[#C9A84C] focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="btn-primary !px-5 !py-2.5 rounded-xl flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
