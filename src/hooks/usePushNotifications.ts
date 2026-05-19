import { usePushNotification } from "./usePushNotification";

export function usePushNotifications() {
  const base = usePushNotification();
  return {
    ...base,
    showLocalNotification: (title: string, options?: NotificationOptions) => {
      if (base.permission !== "granted") return;
      new Notification(title, options);
    },
    simulateCallNotification: (hostName: string, callRoomId: string) => {
      if (base.permission !== "granted") return;
      new Notification("Panggilan Privat Masuk!", {
        body: `Host ${hostName} siap melakukan panggilan video 1-on-1 dengan Anda.`,
        data: { url: `/dashboard/call/${callRoomId}` },
      });
    },
    simulateDMNotification: (senderName: string, messageText: string) => {
      if (base.permission !== "granted") return;
      new Notification(`Pesan Baru dari ${senderName}`, {
        body: messageText,
        data: { url: "/dashboard/chat" },
      });
    },
    simulateDepositNotification: (amount: number) => {
      if (base.permission !== "granted") return;
      new Notification("Koin NV Berhasil Ditambahkan!", {
        body: `Deposit sebesar ${amount.toLocaleString()} berhasil masuk ke wallet.`,
      });
    },
  };
}
