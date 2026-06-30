"use client";

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RealtimeNotification } from "@/hooks/useRealtimeNotifications";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "border-[#0A6B4A]/50 bg-[#0A6B4A]/10 text-[#E8F5E0]",
  error: "border-red-500/50 bg-red-500/10 text-red-200",
  warning: "border-[#C9A84C]/50 bg-[#C9A84C]/10 text-[#C9A84C]",
  info: "border-[#4D7A60]/50 bg-[#4D7A60]/10 text-[#9DBFAA]",
};

interface ToastProps {
  notification: RealtimeNotification;
  onDismiss: (id: string) => void;
}

export function Toast({ notification, onDismiss }: ToastProps) {
  const Icon = iconMap[notification.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-right-full duration-300",
        colorMap[notification.type]
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{notification.title}</p>
        <p className="text-xs opacity-80 mt-0.5 truncate">
          {notification.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="p-0.5 hover:opacity-70 transition-opacity shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: RealtimeNotification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {toasts.map((toast) => (
        <Toast key={toast.id} notification={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
