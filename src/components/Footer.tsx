"use client";

import { useTranslations } from "next-intl";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations();

  return (
    <footer className="bg-dark-200 border-t border-emerald-800 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo.svg" alt="EQUINOX" className="h-16" />
            </div>
            <p className="text-sm text-gray-400 mb-4">{t("description")}</p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800 text-gray-400 transition-colors hover:bg-gold-500 hover:text-dark-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t("platform")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="transition-colors hover:text-gold-500">{tn("nav.courses")}</a></li>
              <li><a href="#" className="transition-colors hover:text-gold-500">{tn("nav.pricing")}</a></li>
              <li><a href="#" className="transition-colors hover:text-gold-500">{tn("nav.aiNotebook")}</a></li>
              <li><a href="#" className="transition-colors hover:text-gold-500">{tn("nav.forum")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t("support")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Mail size={14} /> support@edutn.tn</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +216 70 000 000</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> تونس العاصمة</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t("legal")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="transition-colors hover:text-gold-500">{t("privacy")}</a></li>
              <li><a href="#" className="transition-colors hover:text-gold-500">{t("terms")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-emerald-800 pt-8 text-center text-sm text-gray-500">
          <p>{t("copyright")}</p>
          <p className="mt-2">
            Made By{" "}
            <a
              href="https://feres-ouerfelli-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#C9A84C] underline underline-offset-4 transition-colors hover:text-[#dfc06a]"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              Feres Ouerfelli
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
