"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  prefix?: string;
  suffix?: string;
  trend?: string;
  delay?: number;
}

export function KPICard({ label, value, icon: Icon, color, prefix = "", suffix = "", trend, delay = 0 }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));

  useEffect(() => {
    if (isNaN(numericValue)) { setDisplayValue(0); return; }
    const duration = 1500;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * numericValue));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue]);

  const formatted = typeof value === "string" && !prefix && !suffix
    ? value
    : `${prefix}${displayValue.toLocaleString()}${suffix}`;

  return (
    <div ref={ref} className="dash-card fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className="rounded-full bg-[#0A6B4A]/20 px-2 py-0.5 text-[10px] font-medium text-[#34D399]">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-[#E8F5E0]">{formatted}</p>
      <p className="text-xs text-[#4D7A60]">{label}</p>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  delay?: number;
}

export function BarChart({ data, height = 200, delay = 0 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="dash-card-flat fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-[#9DBFAA]">{d.value.toLocaleString()}</span>
            <div
              className={cn("w-full rounded-t-lg transition-all duration-700", d.color || "bg-[#0A6B4A]")}
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: "4px",
                animationDelay: `${delay + i * 100}ms`,
              }}
            />
            <span className="text-[9px] text-[#4D7A60] text-center truncate w-full">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  delay?: number;
}

export function DonutChart({ data, size = 160, delay = 0 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;

  const segments = data.map((d) => {
    const pct = (d.value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  const gradientStops = segments.flatMap((s) => [`${s.color} ${s.start}% ${s.start + s.pct}%`]);
  const gradient = `conic-gradient(${gradientStops.join(", ")})`;

  return (
    <div className="dash-card-flat flex items-center gap-6 fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="h-full w-full rounded-full"
          style={{ background: gradient }}
        />
        <div className="absolute inset-4 flex items-center justify-center rounded-full bg-[#142918]">
          <span className="text-lg font-bold text-[#E8F5E0]">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-[#9DBFAA]">{s.label}</span>
            <span className="text-xs font-semibold text-[#E8F5E0]">{Math.round(s.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({ value, size = 80, strokeWidth = 6, color = "#0A6B4A", label, sublabel }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-[#E8F5E0]">{value}%</span>
        </div>
      </div>
      {label && <span className="text-xs font-medium text-[#E8F5E0]">{label}</span>}
      {sublabel && <span className="text-[10px] text-[#4D7A60]">{sublabel}</span>}
    </div>
  );
}

interface TableRow {
  [key: string]: any;
}

interface DataTableProps {
  columns: { key: string; label: string; render?: (val: any, row: TableRow) => React.ReactNode }[];
  data: TableRow[];
  actions?: (row: TableRow) => React.ReactNode;
}

export function DataTable({ columns, data, actions }: DataTableProps) {
  const t = useTranslations("widgets");
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.07)]">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right text-xs font-medium text-[#4D7A60]">{t("actions")}</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-[#E8F5E0]">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FilterChipsProps {
  options: { key: string; label: string; count?: number }[];
  selected: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
            selected === opt.key
              ? "bg-[#0A6B4A] text-[#E8F5E0]"
              : "bg-[rgba(255,255,255,0.05)] text-[#9DBFAA] hover:bg-[rgba(255,255,255,0.08)]"
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className="ml-1 text-[10px] opacity-70">({opt.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
