"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  ChevronLeft, ChevronRight, Settings, FileText, Brain,
  SkipBack, SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

const chapters = [
  { title: "الفصل 1: المتتاليات", lessons: ["تعريف المتتاليات", "نهاية المتتالية", "ال متتاليات المعدودة"] },
  { title: "الفصل 2: الدوال المستمرة", lessons: ["تعريف الدالة المستمرة", "极限定理", "الدالة المتصلة"] },
  { title: "الفصل 3: المشتقات", lessons: ["تعريف المشتقة", "قواعد التفاضل", "المشتقات العليا"] },
];

export default function WatchPage() {
  const t = useTranslations("player");
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [speed, setSpeed] = useState("1x");
  const [showSettings, setShowSettings] = useState(false);
  const [activePanel, setActivePanel] = useState<"chapters" | "notes" | "ai">("chapters");

  const speeds = ["0.75x", "1x", "1.25x", "1.5x", "2x"];

  return (
    <div className="flex h-screen flex-col bg-dark-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-dark-300 px-4 py-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ChevronRight size={16} className="rtl:rotate-180" />
          {t("back")}
        </button>
        <h1 className="text-sm font-medium text-white">{t("lessonPrefix")} 8 — Calcul</h1>
        <div className="w-20" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex flex-1 flex-col">
          {/* Player */}
          <div className="relative flex-1 bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Play size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">{t("clickToPlay")}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress */}
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs text-gray-400">15:30</span>
                <div
                  className="group relative h-1 flex-1 cursor-pointer rounded-full bg-gray-600"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    setProgress((x / rect.width) * 100);
                  }}
                >
                  <div
                    className="h-full rounded-full bg-gold-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gold-500 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ left: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">45:00</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:text-gold-500"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <SkipBack size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <SkipForward size={18} />
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Settings size={18} />
                    </button>
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 rounded-lg border border-emerald-700 bg-dark-50 p-2">
                        <p className="mb-1 text-xs text-gray-400">{t("speed")}</p>
                        {speeds.map((s) => (
                          <button
                            key={s}
                            onClick={() => { setSpeed(s); setShowSettings(false); }}
                            className={cn(
                              "block w-full rounded px-3 py-1 text-left text-xs",
                              speed === s ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-emerald-800"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <Maximize size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Download PDF */}
          <div className="flex items-center justify-between bg-dark-300 px-4 py-3">
            <div className="text-sm text-gray-400">
              {t("lessonPrefix")} 8: Derivatives — Calcul
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
              <FileText size={14} />
              {t("downloadPdf")}
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="hidden w-80 border-l border-emerald-800 bg-dark-300 lg:block">
          <div className="flex border-b border-emerald-800">
            {(["chapters", "notes", "ai"] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={cn(
                  "flex-1 py-3 text-xs font-medium transition-colors",
                  activePanel === panel
                    ? "border-b-2 border-gold-500 text-gold-500"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                {panel === "chapters" ? t("chapters") : panel === "notes" ? t("notes") : t("aiAssistant")}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-3" style={{ height: "calc(100% - 44px)" }}>
            {activePanel === "chapters" && (
              <div className="space-y-2">
                {chapters.map((chapter, ci) => (
                  <div key={ci}>
                    <p className="mb-1 px-2 text-xs font-semibold text-gray-400">{chapter.title}</p>
                    {chapter.lessons.map((lesson, li) => (
                      <button
                        key={li}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          ci === 0 && li === 1
                            ? "bg-emerald-800 text-gold-500"
                            : "text-gray-400 hover:bg-emerald-900 hover:text-gray-200"
                        )}
                      >
                        <Play size={12} />
                        <span className="flex-1">{lesson}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {activePanel === "notes" && (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                <FileText size={32} className="mb-2 opacity-50" />
                <p className="text-xs">{t("notesAppearHere")}</p>
              </div>
            )}

            {activePanel === "ai" && (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                <Brain size={32} className="mb-2 opacity-50" />
                <p className="text-xs">{t("askAIAboutLesson")}</p>
                <button
                  onClick={() => router.push("/dashboard/ai")}
                  className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-xs text-white hover:bg-emerald-700"
                >
                  {t("openNotebook")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
