"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getPusher } from "@/lib/realtime";

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: Date;
}

export function useRealtimeNotifications(userId: number | null) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    []
  );
  const [toasts, setToasts] = useState<RealtimeNotification[]>([]);
  const channelsRef = useRef<Array<{ name: string; unbind_global: () => void }>>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusher();
    if (!pusher) return;

    let channelName: string;
    let eventName: string;

    // Determine channel based on user context
    // The layout passes the role, but we just subscribe to user.{id} for personal notifications
    channelName = `user.${userId}`;
    eventName = "App\\Events";

    const channel = pusher.subscribe(channelName);

    const handleEvent = (data: Record<string, unknown>) => {
      const notification: RealtimeNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: (data.title as string) || "Notification",
        message: (data.message as string) || "",
        type: getNotificationType(data),
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setToasts((prev) => [...prev, notification]);

      // Auto-dismiss toast after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notification.id));
      }, 6000);
    };

    // Listen to all broadcast events on the channel
    channel.bind_global((eventName: string, data: Record<string, unknown>) => {
      if (eventName.startsWith("App\\Events")) {
        handleEvent(data);
      } else if (eventName.includes(".")) {
        handleEvent(data);
      }
    });

    channelsRef.current.push(channel);

    return () => {
      channelsRef.current.forEach((ch) => {
        try {
          ch.unbind_global();
          pusher.unsubscribe(ch.name);
        } catch {}
      });
      channelsRef.current = [];
    };
  }, [userId]);

  return { notifications, toasts, removeToast };
}

function getNotificationType(
  data: Record<string, unknown>
): "success" | "error" | "info" | "warning" {
  if (data.type === "payment.approved" || data.type === "subscription_activated")
    return "success";
  if (data.type === "payment.rejected" || data.type === "fraud_reported")
    return "error";
  if (data.type === "fraud.alert") return "warning";
  return "info";
}
