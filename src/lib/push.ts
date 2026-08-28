import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;
let configFailed = false;

/** Returns false if VAPID config is missing/invalid — caller should bail out without sending. */
function ensureConfigured(): boolean {
  if (configFailed) return false;
  if (configured) return true;
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    configured = true;
    return true;
  } catch (err) {
    configFailed = true;
    console.error("web-push VAPID config invalid — push disabled for this instance:", err);
    return false;
  }
}

export type PushPayload = { title: string; body: string; url?: string };

/** Best-effort: push is a bonus channel — any failure here (missing/invalid config, no subscription, expired endpoint) must never break the caller's primary action. */
export async function sendPushToPlayers(playerIds: string[], payload: PushPayload) {
  if (playerIds.length === 0) return;
  if (!process.env.VAPID_PRIVATE_KEY) return;

  try {
    if (!ensureConfigured()) return;

    const admin = createAdminClient();
    const { data: subscriptions } = await admin.from("push_subscriptions").select("*").in("player_id", playerIds);
    if (!subscriptions?.length) return;

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys as unknown as { p256dh: string; auth: string } },
            JSON.stringify(payload),
          );
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await admin.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }),
    );
  } catch (err) {
    console.error("sendPushToPlayers failed:", err);
  }
}
