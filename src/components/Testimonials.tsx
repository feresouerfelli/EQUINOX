"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "أحمد بن علي",
    role: "طالب هندسة - جامعة تونس",
    text: "EQUINOX غيّرت طريقة تعلمي. الدروس واضحة والأساتذة ممتازين. أنصح كل طالب جامعي بالاشتراك.",
    rating: 5,
  },
  {
    name: "Sarah Ben Ahmed",
    role: "Étudiante en Médecine - Université de Sfax",
    text: "La plateforme est incroyable. Les sessions live avec les professeurs et le cahier IA m'ont énormément aidée pour mes examens.",
    rating: 5,
  },
  {
    name: "Fatma Trabelsi",
    role: "Computer Science Student - University of Manouba",
    text: "The AI notebook feature is a game-changer. I can ask questions about any topic and get instant, well-structured answers. Highly recommend!",
    rating: 5,
  },
];

export default function Testimonials() {
  const t = useTranslations("testimonials");

  return (
    <section className="bg-ivory-100 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="card">
              <div className="mb-3 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="fill-gold-500 text-gold-500"
                  />
                ))}
              </div>
              <p className="mb-4 text-sm text-gray-600">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
