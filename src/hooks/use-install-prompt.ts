"use client";

import { useEffect, useState } from "react";
import { isIos, isStandalone } from "@/lib/push-client";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  // Assume installed / not-iOS until the effect resolves — avoids a flash of
  // install UI before we actually know (also keeps SSR and first client
  // render identical, since window/navigator aren't available on the server).
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setStandalone(isStandalone());
      setIos(isIos());
    });

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredPrompt(null);
      setStandalone(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return {
    isStandalone: standalone,
    isIos: ios,
    canPromptInstall: !!deferredPrompt,
    promptInstall,
  };
}
