"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "professor" | "admin")[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const roleRedirect: Record<string, string> = {
        admin: "/admin",
        professor: "/professor",
        student: "/dashboard",
      };
      router.replace(roleRedirect[user.role] || "/dashboard");
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated || !user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
