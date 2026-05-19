// Service Worker for NVide Live Push Notifications

self.addEventListener("push", (event) => {
  let data = { title: "NVide Live", body: "Ada aktivitas baru untuk Anda!" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data = { title: "NVide Live", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png", // fallback icon
    badge: "/icons/badge.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
