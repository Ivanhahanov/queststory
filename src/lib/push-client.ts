import type { createClient } from "@/lib/supabase/client";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// NEXT_PUBLIC_-переменная инлайнится сборщиком в билд-тайм — если её не задать
// в окружении Vercel, здесь останется undefined и подписка будет молча падать
// на каждом устройстве без этой проверки.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Requests notification permission (if not already decided) and registers a
 * push subscription for this player. Safe to call from any user-gesture
 * handler (install button, banner tap) — never throws, returns whether a
 * subscription now exists.
 */
export async function subscribeToPush(
  supabase: ReturnType<typeof createClient>,
  playerId: string,
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY) return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  try {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));
    const json = subscription.toJSON();
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({ player_id: playerId, endpoint: json.endpoint!, keys: json.keys! }, { onConflict: "endpoint" });
    return !error;
  } catch (err) {
    console.error("Не удалось подписаться на push:", err);
    return false;
  }
}
