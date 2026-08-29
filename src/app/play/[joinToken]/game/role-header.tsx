"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { roleAvatarUrl } from "@/lib/avatar-options";
import { CharacterCard } from "@/components/character-card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Game, Role, VisibleGoal } from "@/lib/types";

export function RoleHeader({
  role,
  displayName,
  points,
  game,
  goals,
}: {
  role: Role | null;
  displayName: string | null;
  points: number;
  game: Game;
  goals: VisibleGoal[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => role && setOpen(true)}
        disabled={!role}
        className="flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors enabled:hover:bg-muted/40 enabled:active:scale-[0.99]"
      >
        <div
          className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2"
          style={{ borderColor: role?.color ?? "var(--border)" }}
        >
          {role ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={roleAvatarUrl(role)} alt={role.name} className="size-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">Роль скоро будет назначена</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-xs text-muted-foreground">{displayName}</p>
          <h1 className="truncate text-xl font-semibold">{role?.name ?? "Ожидание роли"}</h1>
          {points !== 0 && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              <Coins className="size-3.5" /> {points}
            </span>
          )}
          {role && <p className="text-xs text-primary">Нажмите, чтобы открыть карточку персонажа</p>}
        </div>
      </button>

      {role && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex max-h-[92vh] flex-col overflow-y-auto sm:max-w-md">
            <DialogTitle className="sr-only">Карточка персонажа: {role.name}</DialogTitle>
            <DialogDescription className="sr-only">История, цели и описание вашего персонажа</DialogDescription>
            <CharacterCard game={game} role={role} goals={goals} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
