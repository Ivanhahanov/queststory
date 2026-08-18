"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, X } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { inviteUrl } from "@/lib/invite-url";
import type { Player } from "@/lib/types";

export function QrHandoffDialog({
  player,
  onClose,
  onClaimed,
}: {
  player: Player | null;
  onClose: () => void;
  onClaimed: (player: Player) => void;
}) {
  const supabase = useSupabaseClient();
  const [claimedName, setClaimedName] = useState<string | null>(player?.display_name ?? null);

  useEffect(() => {
    Promise.resolve().then(() => setClaimedName(player?.display_name ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id]);

  useEffect(() => {
    if (!player || player.display_name) return;

    const channel = supabase
      .channel(`handoff-${player.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "players", filter: `id=eq.${player.id}` },
        (payload) => {
          const row = payload.new as Player;
          if (row.display_name) {
            setClaimedName(row.display_name);
            onClaimed(row);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id]);

  if (!player) return null;

  const link = inviteUrl(player.join_token);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background p-6 text-center">
      <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
        <X />
      </Button>

      {claimedName ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="size-8" />
          </div>
          <p className="text-xl font-semibold">Присоединился: {claimedName}</p>
          <Button size="lg" onClick={onClose} className="mt-2">
            Готово
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <p className="text-lg font-medium">Дайте игроку отсканировать код</p>
            <p className="text-sm text-muted-foreground">Роль откроется у него на телефоне после ввода имени</p>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <QRCodeSVG value={link} size={240} />
          </div>
          <p className="max-w-xs text-xs break-all text-muted-foreground">{link}</p>
        </>
      )}
    </div>
  );
}
