"use client";

import { useState } from "react";
import { ChevronRight, Globe2, Plus } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { randomAvatarSeed } from "@/lib/dicebear";
import { roleAvatarUrl } from "@/lib/avatar-options";
import type { Game, Goal, Role, Round } from "@/lib/types";
import { RoleEditorDialog } from "./role-editor-dialog";

export function RolesTab({
  gameId,
  game,
  roles,
  goals,
  rounds,
  onRolesChange,
  onGoalsChange,
}: {
  gameId: string;
  game: Game;
  roles: Role[];
  goals: Goal[];
  rounds: Round[];
  onRolesChange: (roles: Role[]) => void;
  onGoalsChange: (goals: Goal[]) => void;
}) {
  const supabase = useSupabaseClient();
  const [busy, setBusy] = useState(false);
  const [editorTarget, setEditorTarget] = useState<"common" | string | null>(null);

  async function addRole() {
    setBusy(true);
    const { data } = await supabase
      .from("roles")
      .insert({ game_id: gameId, name: `Роль ${roles.length + 1}`, avatar_seed: randomAvatarSeed() })
      .select()
      .single();
    if (data) {
      onRolesChange([...roles, data]);
      setEditorTarget(data.id);
    }
    setBusy(false);
  }

  async function removeRole(id: string) {
    onRolesChange(roles.filter((r) => r.id !== id));
    await supabase.from("roles").delete().eq("id", id);
  }

  const commonGoalsCount = goals.filter((g) => g.role_id === null).length;
  const editingRole = editorTarget && editorTarget !== "common" ? (roles.find((r) => r.id === editorTarget) ?? null) : null;
  const dialogOpen = editorTarget === "common" || !!editingRole;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Роли</h2>
          <p className="text-sm text-muted-foreground">Аватар, описание и цели каждой роли — в одном окне.</p>
        </div>
        <Button onClick={addRole} disabled={busy}>
          <Plus /> Добавить роль
        </Button>
      </div>

      {roles.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Ролей пока нет</CardTitle>
            <CardDescription>Добавьте первую роль, чтобы начать распределять персонажей.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="divide-y divide-border/60 rounded-xl border border-border/60">
        <button
          type="button"
          onClick={() => setEditorTarget("common")}
          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-primary/40 bg-primary/10 text-primary">
            <Globe2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Общие цели</p>
            <p className="text-xs text-muted-foreground">Для всех игроков · {commonGoalsCount}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>

        {roles.map((role) => {
          const count = goals.filter((g) => g.role_id === role.id).length;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setEditorTarget(role.id)}
              className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-muted"
                style={{ borderColor: role.color }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={roleAvatarUrl(role)} alt={role.name} className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{role.name}</p>
                <p className="text-xs text-muted-foreground">{count} {count === 1 ? "цель" : "целей"}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      <RoleEditorDialog
        gameId={gameId}
        game={game}
        role={editorTarget === "common" ? null : editingRole}
        goals={goals}
        rounds={rounds}
        open={dialogOpen}
        onOpenChange={(open) => !open && setEditorTarget(null)}
        onRoleChange={(updated) => onRolesChange(roles.map((r) => (r.id === updated.id ? updated : r)))}
        onGoalsChange={onGoalsChange}
        onDeleteRole={
          editingRole
            ? () => {
                removeRole(editingRole.id);
                setEditorTarget(null);
              }
            : undefined
        }
      />
    </div>
  );
}
