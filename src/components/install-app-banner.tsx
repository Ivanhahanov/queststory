"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { subscribeToPush } from "@/lib/push-client";

const DISMISS_KEY = "qs-install-banner-dismissed";

export function InstallAppBanner({ playerId }: { playerId?: string }) {
  const { isStandalone, isIos, canPromptInstall, promptInstall } = useInstallPrompt();
  const supabase = useSupabaseClient();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (localStorage.getItem(DISMISS_KEY)) setDismissed(true);
    });
  }, []);

  if (isStandalone || dismissed) return null;
  if (!isIos && !canPromptInstall) return null; // Android/desktop: wait for the browser's own install signal

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  // Запрашиваем разрешение на уведомления сразу в том же клике, которым
  // пользователь принял установку — активация от жеста браузер ещё считает
  // "свежей", так что второй системный диалог не выглядит рекламным спамом,
  // и не нужен отдельный баннер «Включите уведомления» вторым шагом.
  async function install() {
    const outcome = await promptInstall();
    dismiss();
    if (outcome === "accepted" && playerId) {
      const ok = await subscribeToPush(supabase, playerId);
      if (ok) toast("Игра установлена, уведомления включены");
    }
  }

  return (
    <Card className="border-primary/40 bg-primary/10">
      <CardContent className="flex items-start gap-3 text-sm">
        {isIos ? (
          <>
            <Share className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="flex-1">
              Установите игру на экран «Домой»: нажмите «Поделиться» → «На экран Домой». Игра может идти долго — так вы
              не потеряете доступ, если случайно закроете вкладку, и сможете получать уведомления.
            </p>
          </>
        ) : (
          <>
            <Download className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex-1 space-y-2">
              <p>Установите игру на экран — не потеряете доступ, если закроете вкладку, и будете получать уведомления от ведущего.</p>
              <Button onClick={install}>Установить</Button>
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
