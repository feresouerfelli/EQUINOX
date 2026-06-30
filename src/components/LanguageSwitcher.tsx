"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const locales = [
  { code: "ar" as const, label: "العربية", flag: "🇹🇳" },
  { code: "fr" as const, label: "Français", flag: "🇫🇷" },
  { code: "en" as const, label: "English", flag: "🇬🇧" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale) || locales[1];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-emerald-800 hover:text-white"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-lg border border-emerald-700 bg-dark-50 shadow-lg">
          {locales.map((l) => (
            <a
              key={l.code}
              href={`/${l.code}`}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-emerald-800",
                locale === l.code
                  ? "bg-emerald-800/50 text-gold-500"
                  : "text-gray-300"
              )}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
