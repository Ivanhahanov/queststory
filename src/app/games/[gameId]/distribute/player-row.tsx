"use client";

import { useState } from "react";
import { Check, Copy, MoreVertical, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dicebearUrl } from "@/lib/dicebear";
import { parseAvatarOptions } from "@/lib/avatar-options";
import { inviteUrl } from "@/lib/invite-url";
import type { Player, Role } from "@/lib/types";

export function PlayerRow({
  player,
  role,
  onReopenQr,
  onRegenerateLink,
  onDelete,
}: {
  player: Player;
  role: Role;
  onReopenQr: () => void;
  onRegenerateLink: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl(player.join_token));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2"
        style={{ borderColor: role.color }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dicebearUrl(role.avatar_style, role.avatar_seed, parseAvatarOptions(role.avatar_options))}
          alt=""
          className="size-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{role.name}</p>
        {player.display_name ? (
          <p className="flex items-center gap-1.5 text-sm text-emerald-500">
            <span className="size-1.5 rounded-full bg-emerald-500" /> {player.display_name}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Ждём игрока</p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onReopenQr}>
            <QrCode /> Показать QR ещё раз
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyLink}>
            {copied ? <Check /> : <Copy />} {copied ? "Скопировано" : "Скопировать ссылку"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRegenerateLink}>
            <RefreshCw /> Перевыпустить ссылку
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 /> Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
