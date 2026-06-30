"use client";

import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher | null {
  if (typeof window === "undefined") return null;

  if (pusherInstance) return pusherInstance;

  try {
    const scheme =
      process.env.NEXT_PUBLIC_REVERB_SCHEME || "http";
    const host =
      process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1";
    const port =
      process.env.NEXT_PUBLIC_REVERB_PORT || "8080";

    pusherInstance = new Pusher(
      process.env.NEXT_PUBLIC_REVERB_APP_KEY || "edutn-key",
      {
        cluster: "mt1",
        wsHost: host,
        wsPort: parseInt(port),
        wssPort: parseInt(port),
        forceTLS: scheme === "https",
        enabledTransports: ["ws", "wss"],
        authEndpoint: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined"
                ? localStorage.getItem("access_token") || ""
                : ""
            }`,
          },
        },
      }
    );

    pusherInstance.connection.bind("error", () => {
      console.warn(
        "[Reverb] Connection failed — is Reverb running? (php artisan reverb:start)"
      );
    });

    return pusherInstance;
  } catch (err) {
    console.warn("[Reverb] Init failed:", err);
    return null;
  }
}

export function disconnectPusher(): void {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}
