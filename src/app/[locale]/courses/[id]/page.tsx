"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Star, Users, Clock, Play, ChevronDown, ChevronUp, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const course = {
  id: 1,
  title: "التحليل الرياضي",
  titleFr: "Analyse Mathématique",
  prof: "د. محمد بن علي",
  rating: 4.8,
  students: 320,
  price: 39,
  isFree: false,
  specialty: "الهندسة",
  level: "L2",
  totalLessons: 24,
  totalHours: 36,
  description: "مقرر شامل في التحليل الرياضي يغطي المتتاليات، الدوال المستمرة، المشتقات، والتفاضل والتكامل. مناسب لطلاب الهندسة والعلوم.",
  chapters: [
    {
      title: "الفصل 1: المتتاليات",
      lessons: [
        { title: "تعريف المتتاليات", duration: "45:00", isPreview: true },
        { title: "نهاية المتتالية", duration: "52:00", isPreview: false },
        { title: "ال متتاليات المعدودة", duration: "38:00", isPreview: false },
      ],
    },
    {
      title: "الفصل 2: الدوال المستمرة",
      lessons: [
        { title: "تعريف الدالة المستمرة", duration: "48:00", isPreview: true },
        { title: "极限定理", duration: "55:00", isPreview: false },
        { title: "الدالة المتصلة", duration: "42:00", isPreview: false },
      ],
    },
    {
      title: "الفصل 3: المشتقات",
      lessons: [
        { title: "تعريف المشتقة", duration: "50:00", isPreview: true },
        { title: "قواعد التفاضل", duration: "45:00", isPreview: false },
        { title: "المشتقات العليا", duration: "40:00", isPreview: false },
      ],
    },
  ],
  reviews: [
    { name: "أحمد بن علي", rating: 5, comment: "ممتاز، الأستاذ يشرح بوضوح شديد" },
    { name: "Sarah B.", rating: 4, comment: "Très bon cours, contenu complet et bien structuré" },
  ],
};

const tabs = ["overview", "curriculum", "professor", "reviews"];

export default function CourseDetailPage() {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("curriculum");
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);

  const toggleChapter = (index: number) => {
    setExpandedChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="pb-20 lg:pb-6">
      {/* Hero */}
      <div className="bg-emerald-600 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="badge-emerald">{course.specialty}</span>
                <span className="badge-emerald">{course.level}</span>
                {course.isFree && <span className="badge-gold">{t("freePreview")}</span>}
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white">{course.title}</h1>
              <p className="mb-4 text-sm text-emerald-200">{course.titleFr}</p>
              <div className="mb-4 flex items-center gap-4 text-sm text-emerald-200">
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-gold-500 text-gold-500" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {course.students} {t("enrolledCount")}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {course.totalLessons} {t("lesson")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {course.totalHours} {t("lesson")}
                </span>
              </div>
              <p className="mb-6 text-sm text-emerald-100">{course.prof}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/courses/${course.id}/watch`)}
                  className="btn-primary bg-gold-500 text-dark-200 hover:bg-gold-600"
                >
                  <Play size={16} />
                  {course.isFree ? t("freePreview") : tc("enroll")}
                </button>
                {!course.isFree && (
                  <span className="flex items-center text-2xl font-bold text-white">
                    {course.price} {tc("dt")}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full lg:w-72">
              <div className="overflow-hidden rounded-xl bg-emerald-700">
                <div className="flex h-40 items-center justify-center bg-emerald-800 text-emerald-400">
                  <Play size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto border-b border-ivory-300">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-emerald-600"
              )}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="max-w-3xl">
            <h2 className="mb-4 text-xl font-bold text-emerald-900">{t("overview")}</h2>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="max-w-3xl space-y-3">
            {course.chapters.map((chapter, ci) => (
              <div key={ci} className="card overflow-hidden p-0">
                <button
                  onClick={() => toggleChapter(ci)}
                  className="flex w-full items-center justify-between bg-ivory-50 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-emerald-900">{chapter.title}</span>
                  {expandedChapters.includes(ci) ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {expandedChapters.includes(ci) && (
                  <div className="divide-y divide-ivory-200">
                    {chapter.lessons.map((lesson, li) => (
                      <div
                        key={li}
                        onClick={() => lesson.isPreview && router.push(`/courses/${course.id}/watch`)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3",
                          lesson.isPreview && "cursor-pointer hover:bg-emerald-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            {lesson.isPreview ? <Play size={14} /> : <span className="text-xs font-bold">{li + 1}</span>}
                          </div>
                          <span className="text-sm text-gray-700">{lesson.title}</span>
                          {lesson.isPreview && (
                            <span className="badge-emerald text-[10px]">{t("freePreview")}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "professor" && (
          <div className="max-w-3xl">
            <div className="card flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-600">
                م
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900">{course.prof}</h3>
                <p className="text-sm text-gray-500">أستاذ مشارك — الرياضيات التطبيقية</p>
                <p className="mt-3 text-sm text-gray-600">
                  أستاذ مشارك في قسم الرياضيات بجامعة تونس. خبرة تزيد عن 10 سنوات في التدريس. متخصص في التحليل الرياضي والجبر الخطي.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Star size={20} className="fill-gold-500 text-gold-500" />
              <span className="text-2xl font-bold text-emerald-900">{course.rating}</span>
              <span className="text-sm text-gray-500">({course.students} {t("reviews")})</span>
            </div>
            {course.reviews.map((review, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">{review.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} size={12} className="fill-gold-500 text-gold-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
