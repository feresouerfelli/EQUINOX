"use client";

import { useTranslations } from "next-intl";
import { Star, Users, BookOpen, Calendar, Award } from "lucide-react";

const professor = {
  name: "د. محمد بن علي",
  specialty: "الرياضيات التطبيقية",
  rating: 4.8,
  students: 1200,
  courses: 5,
  bio: "أستاذ مشارك في قسم الرياضيات بجامعة تونس. خبرة تزيد عن 10 سنوات في التدريس. متخصص في التحليل الرياضي والجبر الخطي. حاصل على شهادة الدكتوراه من جامعة باريس 6.",
  coursesList: [
    { title: "التحليل الرياضي", students: 320, rating: 4.8 },
    { title: "الجبر الخطي", students: 280, rating: 4.7 },
    { title: "المعادلات التفاضلية", students: 210, rating: 4.6 },
    { title: "الرياضيات المتقطعة", students: 180, rating: 4.5 },
    { title: "الاحتمالات والإحصاء", students: 250, rating: 4.8 },
  ],
};

export default function ProfessorProfilePage() {
  return (
    <div className="pb-20 lg:pb-6">
      {/* Hero */}
      <div className="bg-emerald-600 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold-500 text-3xl font-bold text-dark-200">
              م
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-white">{professor.name}</h1>
                <Award size={18} className="text-gold-500" />
              </div>
              <p className="text-emerald-200">{professor.specialty}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-emerald-200 justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-gold-500 text-gold-500" />
                  {professor.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {professor.students} طالب
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {professor.courses} مقررات
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Bio */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-emerald-900">نبذة شخصية</h2>
              <p className="text-sm leading-relaxed text-gray-600">{professor.bio}</p>
            </div>

            {/* Courses */}
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-emerald-900">المقررات</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {professor.coursesList.map((course, i) => (
                  <div key={i} className="card">
                    <h3 className="text-sm font-semibold text-emerald-900">{course.title}</h3>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-gold-500 text-gold-500" />
                        {course.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {course.students} طالب
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-emerald-900">الحصص القادمة</h3>
              <div className="space-y-2">
                {["اليوم 14:00", "غداً 10:00"].map((time, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-ivory-50 p-3">
                    <Calendar size={16} className="text-emerald-600" />
                    <span className="text-xs text-gray-600">{time}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary w-full">متابعة الأستاذ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
