"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { subscribeToPush } from "@/lib/push-client";

const DISMISS_KEY = "qs-push-banner-dismissed";

export function NotificationsBanner({ playerId }: { playerId: string }) {
  const supabase = useSupabaseClient();
  const { isIos, isStandalone } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // На iOS push вообще не работает вне standalone-режима — баннер об этом
    // показывает InstallAppBanner, здесь просить разрешение ещё рано.
    if (isIos && !isStandalone) return;

    Promise.resolve().then(() => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission !== "default") return; // already granted (subscribeToPush keeps it fresh below) or denied
      if (localStorage.getItem(DISMISS_KEY)) return;
      setVisible(true);
    });

    // Уже разрешено раньше (или подписались сразу при установке PWA) — просто
    // убедиться, что подписка ещё жива, без показа баннера.
    if (Notification.permission === "granted") {
      subscribeToPush(supabase, playerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIos, isStandalone]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function subscribe() {
    setBusy(true);
    const ok = await subscribeToPush(supabase, playerId);
    toast(ok ? "Уведомления включены" : "Не удалось включить уведомления — попробуйте ещё раз позже");
    dismiss();
    setBusy(false);
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
