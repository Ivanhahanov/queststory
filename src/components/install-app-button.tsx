"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";

// iOS Safari никогда не шлёт beforeinstallprompt (Apple его не поддерживает) —
// canPromptInstall там всегда false, и кнопка раньше молча не рендерилась,
// то есть на iPhone у ведущего установка вообще не предлагалась.
export function InstallAppButton() {
  const { isStandalone, isIos, canPromptInstall, promptInstall } = useInstallPrompt();

  if (isStandalone || (!isIos && !canPromptInstall)) return null;

  function handleClick() {
    if (canPromptInstall) {
      promptInstall();
      return;
    }
    toast("Установите игру на экран «Домой»", {
      description: "Нажмите «Поделиться» → «На экран Домой».",
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      <Download /> Установить
    </Button>
  );
}
