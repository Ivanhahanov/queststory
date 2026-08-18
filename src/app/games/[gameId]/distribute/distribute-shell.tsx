"use client";

import { useEffect, useState } from "react";
import { Shuffle, UserPlus } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Player, Role } from "@/lib/types";
import { PlayerRow } from "./player-row";
import { RolePickerDialog } from "./role-picker-dialog";
import { QrHandoffDialog } from "./qr-handoff-dialog";

export function DistributeShell({
  gameId,
  initialRoles,
  initialPlayers,
}: {
  gameId: string;
  initialRoles: Role[];
  initialPlayers: Player[];
}) {
  const supabase = useSupabaseClient();
  const [roles] = useState(initialRoles);
  const [players, setPlayers] = useState(initialPlayers);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [handoffPlayer, setHandoffPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`distribute-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `game_id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setPlayers((prev) => prev.filter((p) => p.id !== (payload.old as Player).id));
            return;
          }
          const row = payload.new as Player;
          setPlayers((prev) => {
            const exists = prev.some((p) => p.id === row.id);
            return exists ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  const freeRoles = roles.filter((r) => !players.some((p) => p.role_id === r.id));

  async function createInvite(roleId: string) {
    const { data } = await supabase
      .from("players")
      .insert({ game_id: gameId, role_id: roleId, assigned_at: new Date().toISOString() })
      .select()
      .single();
    if (!data) return;
    setPlayers((prev) => [...prev, data]);
    setHandoffPlayer(data);
  }

  function pickRole(roleId: string) {
    setPickerOpen(false);
    createInvite(roleId);
  }

  function assignRandom() {
    if (freeRoles.length === 0) return;
    const pick = freeRoles[Math.floor(Math.random() * freeRoles.length)];
    createInvite(pick.id);
  }

  async function regenerateLink(player: Player) {
    const token = crypto.randomUUID().replace(/-/g, "");
    const { data } = await supabase.from("players").update({ join_token: token }).eq("id", player.id).select().single();
    if (data) {
      setPlayers((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setHandoffPlayer(data);
    }
  }

  async function deletePlayer(player: Player) {
    await supabase.from("players").delete().eq("id", player.id);
    setPlayers((prev) => prev.filter((p) => p.id !== player.id));
  }

  const assigned = players
    .map((player) => ({ player, role: roles.find((r) => r.id === player.role_id) }))
    .filter((x): x is { player: Player; role: Role } => !!x.role);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium">Раздача ролей</h2>
        <p className="text-sm text-muted-foreground">
          Подзовите игрока, нажмите «Выдать роль» и покажите ему QR-код — какая роль ему досталась, увидит только он сам.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={() => setPickerOpen(true)} disabled={freeRoles.length === 0}>
          <UserPlus /> Выдать роль
        </Button>
        <Button size="lg" variant="secondary" onClick={assignRandom} disabled={freeRoles.length === 0}>
          <Shuffle /> Случайная роль
        </Button>
      </div>

      {roles.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Сначала создайте роли</CardTitle>
            <CardDescription>Вернитесь в конструктор и добавьте хотя бы одну роль.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {roles.length > 0 && assigned.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Пока никто не получил роль</CardTitle>
            <CardDescription>Нажмите «Выдать роль» или «Случайная роль» на первого игрока.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {assigned.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Выдано: {assigned.length} из {roles.length}
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-border/60 px-6">
            {assigned.map(({ player, role }) => (
              <PlayerRow
                key={player.id}
                player={player}
                role={role}
                onReopenQr={() => setHandoffPlayer(player)}
                onRegenerateLink={() => regenerateLink(player)}
                onDelete={() => deletePlayer(player)}
              />
            ))}
          </div>
        </Card>
      )}

      <RolePickerDialog open={pickerOpen} onOpenChange={setPickerOpen} roles={freeRoles} onPick={pickRole} />
      <QrHandoffDialog
        player={handoffPlayer}
        onClose={() => setHandoffPlayer(null)}
        onClaimed={(row) => setPlayers((prev) => prev.map((p) => (p.id === row.id ? row : p)))}
      />
    </div>
  );
}
