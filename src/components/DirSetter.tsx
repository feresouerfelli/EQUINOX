"use client";

import { useEffect } from "react";

export function DirSetter({ locale, children }: { locale: string; children: React.ReactNode }) {
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  return <>{children}</>;
}
