"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Ban, CheckCircle, Eye, Edit } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { FilterChips } from "@/components/dashboard/Widgets";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const tc = useTranslations("common");
  const token = useAuthStore((s) => s.token);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "15" });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      const data = await api.get<any>(`/admin/users?${params}`, token);
      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch {}
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, token]);

  const handleBan = async (id: number) => {
    if (!token) return;
    await api.put(`/admin/users/${id}/ban`, {}, token);
    fetchUsers();
  };

  const roleFilters = [
    { key: "all", label: t("all") },
    { key: "student", label: t("students") },
    { key: "professor", label: t("professors") },
    { key: "admin", label: t("admins") },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <span className="badge-red">{tc("admin")}</span>;
      case "professor": return <span className="badge-blue">{tc("professor")}</span>;
      default: return <span className="badge-green">{tc("student")}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D7A60]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchUsers())}
            placeholder={t("searchPlaceholder")}
            className="input-dark !pl-10"
          />
        </div>
        <FilterChips options={roleFilters} selected={roleFilter} onSelect={(k) => { setRoleFilter(k); setPage(1); }} />
      </div>

      <div className="dash-card-flat fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("name")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("email")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("phone")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("role")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("status")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#4D7A60]">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-4 py-3 text-[#4D7A60]">#{user.id}</td>
                  <td className="px-4 py-3 text-[#E8F5E0]">{user.name}</td>
                  <td className="px-4 py-3 text-[#9DBFAA]">{user.email}</td>
                  <td className="px-4 py-3 text-[#9DBFAA]" dir="ltr">{user.phone}</td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3">
                    <span className={user.is_active ? "badge-green" : "badge-red"}>
                      {user.is_active ? tc("active") : tc("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="rounded-lg p-1.5 text-[#4D7A60] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E8F5E0]">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleBan(user.id)}
                        className={cn("rounded-lg p-1.5 hover:bg-[rgba(255,255,255,0.05)]",
                          user.is_active ? "text-red-400 hover:text-red-400" : "text-[#34D399] hover:text-[#34D399]"
                        )}
                      >
                        {user.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#4D7A60]">{t("noResults")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > 15 && (
        <div className="flex items-center justify-between text-xs text-[#4D7A60]">
          <span>{tc("showing")} {(page - 1) * 15 + 1}-{Math.min(page * 15, total)} {tc("of")} {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-ghost !px-3 !py-1.5 disabled:opacity-30">{tc("previous")}</button>
            <button onClick={() => setPage(page + 1)} disabled={page * 15 >= total} className="btn-ghost !px-3 !py-1.5 disabled:opacity-30">{tc("next")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
