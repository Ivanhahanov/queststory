// Web Push handlers, imported into the Workbox-generated service worker (see next.config.ts).
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Квестория", body: event.data.text() };
  }

  const { title, body, url, icon } = payload;

  event.waitUntil(
    self.registration.showNotification(title || "Квестория", {
      body,
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});
