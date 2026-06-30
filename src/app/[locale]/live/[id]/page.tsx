"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Video, Mic, MicOff, VideoOff, MessageSquare, Hand, Monitor, Users, PhoneOff, Settings } from "lucide-react";

const participants = [
  { name: "د. محمد بن علي", role: "professor", isMuted: false },
  { name: "أحمد بن علي", role: "student", isMuted: true },
  { name: "سارة بن أحمد", role: "student", isMuted: true },
  { name: "خالد الت:NSLayout", role: "student", isMuted: false },
];

const chatMessages = [
  { author: "د. محمد بن علي", text: "مرحباً بالجميع، اليوم سنتكلم عن المشتقات الجزئية", time: "14:02" },
  { author: "أحمد بن علي", text: "أستاذ، هل يمكن شرح الفرق بين المشتقة الجزئية والمشتقة الكاملة؟", time: "14:05" },
  { author: "د. محمد بن علي", text: "سؤال ممتاز أحمد. المشتقة الجزئية تُحسب بالنسبة لمتغير واحد فقط...", time: "14:07" },
];

export default function LiveSessionPage() {
  const t = useTranslations("live");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="flex h-screen flex-col bg-dark-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-dark-300 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium text-white">{t("liveNow")}</span>
          <span className="text-xs text-gray-400">التحليل الرياضي — حصة 12</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Users size={14} />
          <span>{participants.length} مشارك</span>
          <span className="mx-2">•</span>
          <span>01:23:45</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex flex-1 flex-col">
          {/* Main Video */}
          <div className="relative flex-1 bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white">
                  م
                </div>
                <p className="text-sm text-gray-400">د. محمد بن علي</p>
                <p className="text-xs text-emerald-400">{t("professor")}</p>
              </div>
            </div>
          </div>

          {/* Participant Grid */}
          <div className="flex gap-2 bg-dark-300 p-2">
            {participants.map((p, i) => (
              <div
                key={i}
                className="relative h-20 w-28 shrink-0 rounded-lg bg-dark-50 flex items-center justify-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                  {p.name[0]}
                </div>
                <span className="absolute bottom-1 left-1 right-1 truncate text-center text-[10px] text-gray-400">
                  {p.name.split(" ")[0]}
                </span>
                {p.isMuted && (
                  <span className="absolute right-1 top-1 rounded bg-red-500/80 p-0.5">
                    <MicOff size={10} className="text-white" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 bg-dark-300 px-4 py-4">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`rounded-full p-3 transition-colors ${
                isMicOn ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
              }`}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`rounded-full p-3 transition-colors ${
                isCameraOn ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
              }`}
            >
              {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button className="rounded-full bg-emerald-600 p-3 text-white hover:bg-emerald-700">
              <Monitor size={20} />
            </button>
            <button
              onClick={() => setHandRaised(!handRaised)}
              className={`rounded-full p-3 transition-colors ${
                handRaised ? "bg-gold-500 text-dark-200" : "bg-dark-50 text-gray-400 hover:text-white"
              }`}
            >
              <Hand size={20} />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="rounded-full bg-dark-50 p-3 text-gray-400 hover:text-white"
            >
              <MessageSquare size={20} />
            </button>
            <button className="rounded-full bg-red-500 p-3 text-white hover:bg-red-600">
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="flex w-80 flex-col border-l border-emerald-800 bg-dark-300">
            <div className="border-b border-emerald-800 px-4 py-3">
              <h3 className="text-sm font-medium text-white">{t("chat")}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gold-500">{msg.author}</span>
                    <span className="text-[10px] text-gray-500">{msg.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-300">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-emerald-800 p-3">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اكتب رسالة..."
                  className="flex-1 rounded-lg border border-emerald-700 bg-dark-50 px-3 py-2 text-xs text-white placeholder-gray-500"
                />
                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white hover:bg-emerald-700">
                  إرسال
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
