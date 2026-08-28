"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { urlBase64ToUint8Array } from "@/lib/push-client";

// NEXT_PUBLIC_-переменная инлайнится сборщиком в билд-тайм — если её не задать
// в окружении Vercel (Production), здесь останется undefined и подписка будет
// молча падать на каждом устройстве. Лучше не звать pushManager.subscribe()
// вовсе, чем предлагать игроку разрешение на уведомления, которые не заведутся.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const DISMISS_KEY = "qs-push-banner-dismissed";

export function NotificationsBanner({ playerId }: { playerId: string }) {
  const supabase = useSupabaseClient();
  const { isIos, isStandalone } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  async function registerSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      }));
    const json = subscription.toJSON();
    await supabase
      .from("push_subscriptions")
      .upsert({ player_id: playerId, endpoint: json.endpoint!, keys: json.keys! }, { onConflict: "endpoint" });
  }

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) {
      console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY не задан — push-уведомления отключены на этом деплое.");
      return;
    }
    // На iOS push вообще не работает вне standalone-режима — баннер об этом
    // показывает InstallAppBanner, здесь просить разрешение ещё рано.
    if (isIos && !isStandalone) return;

    Promise.resolve().then(async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      if (Notification.permission === "granted") {
        registerSubscription().catch((err) => console.error("Не удалось подписаться на push:", err));
        return;
      }
      if (Notification.permission === "denied" || localStorage.getItem(DISMISS_KEY)) return;

      setVisible(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIos, isStandalone]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function subscribe() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await registerSubscription();
        toast("Уведомления включены");
      }
    } catch (err) {
      console.error("Не удалось подписаться на push:", err);
      toast.error("Не удалось включить уведомления — попробуйте ещё раз позже");
    } finally {
      dismiss();
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <Card className="border-accent/40 bg-accent/10">
      <CardContent className="flex items-start gap-3 text-sm">
        <Bell className="mt-0.5 size-4 shrink-0 text-accent" />
        <div className="flex-1 space-y-2">
          <p>Включите уведомления, чтобы не пропустить сообщения и эффекты от ведущего.</p>
          <Button onClick={subscribe} disabled={busy}>
            Включить
          </Button>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={dismiss}>
          <X />
        </Button>
      </CardContent>
    </Card>
  );
}
