import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export type PushPayload = { title: string; body: string; url?: string };

/** Best-effort: push is a bonus channel, failures (no subscription, expired endpoint) are swallowed. */
export async function sendPushToPlayers(playerIds: string[], payload: PushPayload) {
  if (playerIds.length === 0) return;
  if (!process.env.VAPID_PRIVATE_KEY) return;
  ensureConfigured();

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
}
