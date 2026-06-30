"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Search, Star, Users, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  { id: 1, title: "Math Analysis", prof: "Dr. Mohamed Ben Ali", rating: 4.8, students: 320, price: 39, isFree: false, specialty: "engineering", level: "L2", lessons: 24, hours: 36 },
  { id: 2, title: "General Physics", prof: "Ms. Fatma T.", rating: 4.6, students: 280, price: 0, isFree: true, specialty: "science", level: "L1", lessons: 20, hours: 30 },
  { id: 3, title: "Intro to Programming", prof: "Dr. Ahmed Said", rating: 4.9, students: 450, price: 29, isFree: false, specialty: "engineering", level: "L1", lessons: 32, hours: 48 },
  { id: 4, title: "Macroeconomics", prof: "Ms. Salma Hasni", rating: 4.5, students: 190, price: 0, isFree: true, specialty: "economics", level: "L2", lessons: 16, hours: 24 },
  { id: 5, title: "Circuit Analysis", prof: "Dr. Karim Bouzidi", rating: 4.7, students: 210, price: 35, isFree: false, specialty: "engineering", level: "L3", lessons: 28, hours: 42 },
  { id: 6, title: "Modern History", prof: "Ms. Noura Ben Issa", rating: 4.4, students: 150, price: 0, isFree: true, specialty: "arts", level: "L2", lessons: 18, hours: 27 },
];

export default function CoursesPage() {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const tf = useTranslations("courses.filters");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const specialties = [
    { value: "", label: tc("all") },
    { value: "engineering", label: tf("specialty") + " Engineering" },
    { value: "medicine", label: tf("specialty") + " Medicine" },
    { value: "economics", label: tf("specialty") + " Economics" },
    { value: "arts", label: tf("specialty") + " Arts" },
    { value: "science", label: tf("specialty") + " Science" },
  ];

  const levels = [
    { value: "", label: tc("all") },
    { value: "L1", label: "L1" },
    { value: "L2", label: "L2" },
    { value: "L3", label: "L3" },
    { value: "M1", label: "M1" },
    { value: "M2", label: "M2" },
  ];

  const priceFilters = [
    { value: "", label: tc("all") },
    { value: "free", label: tc("free") },
    { value: "paid", label: tc("paid") },
  ];

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.includes(search) || c.prof.includes(search);
    const matchSpecialty = !selectedSpecialty || c.specialty === selectedSpecialty;
    const matchLevel = !selectedLevel || c.level === selectedLevel;
    const matchPrice =
      !selectedPrice ||
      (selectedPrice === "free" && c.isFree) ||
      (selectedPrice === "paid" && !c.isFree);
    return matchSearch && matchSpecialty && matchLevel && matchPrice;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <h1 className="text-2xl font-bold text-emerald-900">{t("title")}</h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary text-sm lg:hidden"
        >
          <Filter size={16} />
          {t("filters.button")}
        </button>
      </div>

      <div className={cn("flex flex-wrap gap-3", !showFilters && "hidden lg:flex")}>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-500 self-center">{t("filters.specialty")}:</span>
          {specialties.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedSpecialty(s.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedSpecialty === s.value
                  ? "bg-emerald-600 text-white"
                  : "bg-ivory-200 text-gray-600 hover:bg-emerald-100"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-500 self-center">{t("filters.level")}:</span>
          {levels.map((l) => (
            <button
              key={l.value}
              onClick={() => setSelectedLevel(l.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedLevel === l.value
                  ? "bg-emerald-600 text-white"
                  : "bg-ivory-200 text-gray-600 hover:bg-emerald-100"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-500 self-center">{t("filters.price")}:</span>
          {priceFilters.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedPrice(p.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedPrice === p.value
                  ? "bg-emerald-600 text-white"
                  : "bg-ivory-200 text-gray-600 hover:bg-emerald-100"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <div
            key={course.id}
            onClick={() => router.push(`/courses/${course.id}`)}
            className="group card cursor-pointer overflow-hidden p-0"
          >
            <div className="relative h-44 bg-emerald-100">
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-200 text-emerald-600">
                <span className="text-5xl font-bold">{course.title[0]}</span>
              </div>
              <div className="absolute right-3 top-3">
                {course.isFree ? (
                  <span className="badge-emerald">{tc("free")}</span>
                ) : (
                  <span className="badge-gold">{course.price} {tc("dt")}</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="mb-1 text-base font-semibold text-emerald-900 group-hover:text-emerald-600">
                {course.title}
              </h3>
              <p className="mb-3 text-sm text-gray-500">{course.prof}</p>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-ivory-100 px-2 py-0.5 text-[10px] text-gray-500">{course.specialty}</span>
                <span className="rounded-md bg-ivory-100 px-2 py-0.5 text-[10px] text-gray-500">{course.level}</span>
                <span className="rounded-md bg-ivory-100 px-2 py-0.5 text-[10px] text-gray-500">{course.lessons} {t("lesson")}</span>
                <span className="rounded-md bg-ivory-100 px-2 py-0.5 text-[10px] text-gray-500">{course.hours} {tc("hours")}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-gold-500 text-gold-500" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {course.students} {tc("students")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
