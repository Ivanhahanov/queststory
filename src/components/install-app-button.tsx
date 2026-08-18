"use client";

import { Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";

export function InstallAppButton() {
  const { isStandalone, canPromptInstall, promptInstall } = useInstallPrompt();

  if (isStandalone || !canPromptInstall) return null;

  return (
    <Button variant="ghost" size="sm" onClick={promptInstall}>
      <Download /> Установить
    </Button>
  );
}
