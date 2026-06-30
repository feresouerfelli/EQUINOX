"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/courses", label: t("nav.courses") },
    { href: "/pricing", label: t("nav.pricing") },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-800 bg-dark-200/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3"
        >
          <img src="/images/logo.svg" alt="EQUINOX" className="h-20" />
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              onClick={() => router.push(link.href)}
              className="nav-link cursor-pointer text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary text-sm"
            >
              {t("nav.home")}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                {t("common.login")}
              </button>
              <button
                onClick={() => router.push("/register")}
                className="btn-primary text-sm"
              >
                {t("common.startFree")}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-emerald-800 bg-dark-200 px-4 py-4 md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              onClick={() => {
                router.push(link.href);
                setIsOpen(false);
              }}
              className="block cursor-pointer py-3 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-3 border-t border-emerald-800 pt-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <button
                onClick={() => {
                  router.push("/dashboard");
                  setIsOpen(false);
                }}
                className="btn-primary w-full text-sm"
              >
                {t("nav.home")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push("/login");
                    setIsOpen(false);
                  }}
                  className="w-full py-2 text-sm font-medium text-gray-300"
                >
                  {t("common.login")}
                </button>
                <button
                  onClick={() => {
                    router.push("/register");
                    setIsOpen(false);
                  }}
                  className="btn-primary w-full text-sm"
                >
                  {t("common.startFree")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
