"use client";

import { Button } from "@/components/ui/button";
import { usePushNotification } from "@/hooks/usePushNotification";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { isSupported, permission, requestPermission, subscribe, unsubscribe } = usePushNotification();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">Notifikasi</h1>
      <div className="p-4 rounded-2xl border bg-card text-sm space-y-2">
        <p>Status izin: <span className="font-bold">{permission}</span></p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={async () => {
              const ok = await requestPermission();
              toast[ok ? "success" : "error"](ok ? "Izin notifikasi diaktifkan" : "Izin notifikasi ditolak");
            }}
            disabled={!isSupported}
          >
            Minta Izin
          </Button>
          <Button size="sm" variant="outline" onClick={() => subscribe().then(() => toast.success("Subscribed")).catch((e) => toast.error(e.message))}>
            Subscribe Push
          </Button>
          <Button size="sm" variant="outline" onClick={() => unsubscribe().then(() => toast.success("Unsubscribed"))}>
            Unsubscribe
          </Button>
        </div>
      </div>
      <div className="p-4 rounded-2xl border bg-card text-sm text-muted-foreground">
        Belum ada notifikasi baru.
      </div>
    </div>
  );
}
