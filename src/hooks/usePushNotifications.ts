import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 1. Register Service Worker & check permission on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) {
      console.warn("Browser tidak mendukung push notification.");
      return;
    }

    // Get current permission status
    setPermission(Notification.permission);

    // Register sw.js
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => {
        console.log("[Service Worker] Registered successfully:", reg);
        setSwRegistration(reg);
      })
      .catch((err) => {
        console.error("[Service Worker] Registration failed:", err);
      });
  }, []);

  // 2. Request notification permission
  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Browser Anda tidak mendukung notifikasi.");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        toast.success("Izin notifikasi diberikan! Anda akan menerima update penting.");
        showLocalNotification("Notifikasi NVide Aktif!", {
          body: "Terima kasih telah mengaktifkan notifikasi premium kami.",
        });
        return true;
      } else {
        toast.warning("Izin notifikasi ditolak. Anda mungkin melewatkan info interaksi.");
        return false;
      }
    } catch (err) {
      console.error("Gagal meminta izin notifikasi:", err);
      return false;
    }
  };

  // 3. Trigger native local/push notification
  const showLocalNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== "granted") {
      console.warn("Izin notifikasi belum diberikan.");
      return;
    }

    // If Service Worker is registered, use it to show background-friendly notification
    if (swRegistration) {
      swRegistration.showNotification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge.png",
        vibrate: [100, 50, 100],
        ...options,
      } as any);
    } else {
      // Fallback to standard web notification
      new Notification(title, options);
    }
  };

  // 4. MOCK TRIGGER: Simulate call incoming notification
  const simulateCallNotification = (hostName: string, callRoomId: string) => {
    showLocalNotification(`Panggilan Privat Masuk! 📞`, {
      body: `Host ${hostName} siap melakukan panggilan video 1-on-1 dengan Anda. Klik untuk bergabung.`,
      tag: "call-incoming",
      data: {
        url: `/dashboard/call/${callRoomId}`,
      },
    });
  };

  // 5. MOCK TRIGGER: Simulate DM notification
  const simulateDMNotification = (senderName: string, messageText: string) => {
    showLocalNotification(`Pesan Baru dari ${senderName} 💬`, {
      body: messageText,
      tag: "dm-incoming",
      data: {
        url: "/dashboard/chat",
      },
    });
  };

  // 6. MOCK TRIGGER: Simulate deposit confirmation
  const simulateDepositNotification = (amount: number) => {
    showLocalNotification(`Koin NV Berhasil Ditambahkan! 🪙`, {
      body: `Deposit sebesar ${amount.toLocaleString()} koin berhasil masuk ke Wallet Anda.`,
      tag: "deposit-success",
      data: {
        url: "/dashboard/wallet",
      },
    });
  };

  return {
    permission,
    requestPermission,
    showLocalNotification,
    simulateCallNotification,
    simulateDMNotification,
    simulateDepositNotification,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
