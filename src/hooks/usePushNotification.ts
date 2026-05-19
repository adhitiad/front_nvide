"use client";

import { useEffect, useMemo, useState } from "react";

type PushSubscriptionPayload = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const isSupported = useMemo(
    () =>
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
    []
  );

  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission);
    navigator.serviceWorker
      .register("/push-sw.js")
      .then((reg) => setRegistration(reg))
      .catch(() => undefined);
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const subscribe = async () => {
    if (!registration) throw new Error("Service worker belum siap");
    const hasPerm = permission === "granted" || (await requestPermission());
    if (!hasPerm) throw new Error("Izin notifikasi ditolak");

    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapid ? urlBase64ToUint8Array(vapid) : (undefined as any),
    });
    const raw = sub.toJSON() as PushSubscriptionPayload;
    // Use Better Auth session cookies automatically — browser sends the
    // httpOnly better-auth.session_token cookie with this same-origin fetch.
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: raw.endpoint,
        keys: raw.keys || {},
        topics: ["stream_followed", "gift_received", "clip_ready", "private_chat", "show_request"],
      }),
    });
    return sub;
  };

  const unsubscribe = async () => {
    if (!registration) return;
    const sub = await registration.pushManager.getSubscription();
    if (!sub) return;
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    // Better Auth session cookie is sent automatically by the browser
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint }),
    });
  };

  return { permission, isSupported, requestPermission, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
