"use client";

import { useEffect, useState } from "react";
import { Bell, Share, X } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isIos, isStandalone, urlBase64ToUint8Array } from "@/lib/push-client";

const DISMISS_KEY = "qs-push-banner-dismissed";

type Mode = "hidden" | "ios-install" | "subscribe";

export function NotificationsBanner({ playerId }: { playerId: string }) {
  const supabase = useSupabaseClient();
  const [mode, setMode] = useState<Mode>("hidden");
  const [busy, setBusy] = useState(false);

  async function registerSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      }));
    const json = subscription.toJSON();
    await supabase
      .from("push_subscriptions")
      .upsert({ player_id: playerId, endpoint: json.endpoint!, keys: json.keys! }, { onConflict: "endpoint" });
  }

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      if (Notification.permission === "granted") {
        registerSubscription().catch(() => {});
        return;
      }
      if (Notification.permission === "denied" || localStorage.getItem(DISMISS_KEY)) return;

      setMode(isIos() && !isStandalone() ? "ios-install" : "subscribe");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setMode("hidden");
  }

  async function subscribe() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") await registerSubscription();
    } finally {
      dismiss();
      setBusy(false);
    }
  }

  if (mode === "hidden") return null;

  return (
    <Card className="border-accent/40 bg-accent/10">
      <CardContent className="flex items-start gap-3 text-sm">
        {mode === "ios-install" ? (
          <>
            <Share className="mt-0.5 size-4 shrink-0 text-accent" />
            <p className="flex-1">
              Чтобы получать уведомления, добавьте страницу на экран «Домой»: нажмите «Поделиться» → «На экран
              Домой».
            </p>
          </>
        ) : (
          <>
            <Bell className="mt-0.5 size-4 shrink-0 text-accent" />
            <div className="flex-1 space-y-2">
              <p>Включите уведомления, чтобы не пропустить сообщения и эффекты от ведущего.</p>
              <Button size="sm" onClick={subscribe} disabled={busy}>
                Включить
              </Button>
            </div>
          </>
        )}
        <Button variant="ghost" size="icon-sm" onClick={dismiss}>
          <X />
        </Button>
      </CardContent>
    </Card>
  );
}
