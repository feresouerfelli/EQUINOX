"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { Play, ArrowLeft } from "lucide-react";

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Hero() {
  const t = useTranslations("hero");
  const router = useRouter();

  const stats = [
    { value: 12000, label: t("stats.students") },
    { value: 150, label: t("stats.courses") },
    { value: 2500, label: t("stats.lessons") },
    { value: 4.8, label: t("stats.rating"), isDecimal: true },
  ];

  return (
    <section className="relative overflow-hidden bg-dark-200 pt-24 pb-20">
      <div className="grid-overlay absolute inset-0" />

      <div className="orb orb-emerald absolute top-20 right-[10%] h-48 w-48 animate-float" />
      <div className="orb orb-gold absolute bottom-20 left-[15%] h-32 w-32 animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="badge-gold mb-6 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {t("badge")}
          </div>

          <h1 className="shimmer-text mb-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("title")}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
            {t("subtitle")}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => router.push("/register")}
              className="btn-primary animate-gold-glow group px-8 py-4 text-base"
            >
              {t("cta1")}
              <ArrowLeft className="transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" size={18} />
            </button>
            <button
              onClick={() => router.push("/courses")}
              className="btn-secondary px-8 py-4 text-base"
            >
              {t("cta2")}
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-gold-500 md:text-4xl">
                  {stat.isDecimal ? (
                    stat.value
                  ) : (
                    <AnimatedCounter target={stat.value} />
                  )}
                  {!stat.isDecimal && i < 3 && "+"}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
