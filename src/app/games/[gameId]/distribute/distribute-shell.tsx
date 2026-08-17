"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Player, Role } from "@/lib/types";
import { PlayerInviteCard } from "./player-invite-card";

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

  async function addSlot() {
    const { data } = await supabase.from("players").insert({ game_id: gameId }).select().single();
    if (data) setPlayers((prev) => [...prev, data]);
  }

  const assignedRoleIds = new Set(players.map((p) => p.role_id).filter(Boolean));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Участники</h2>
          <p className="text-sm text-muted-foreground">
            Добавьте слот на каждого игрока, назначьте роль и покажите ему QR-код или отправьте ссылку.
          </p>
        </div>
        <Button onClick={addSlot} disabled={roles.length === 0}>
          <UserPlus /> Добавить участника
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

      {roles.length > 0 && players.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Участников пока нет</CardTitle>
            <CardDescription>Нажмите «Добавить участника» на каждого игрока.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <PlayerInviteCard
            key={player.id}
            player={player}
            roles={roles}
            assignedRoleIds={assignedRoleIds}
            onChange={(updated) => setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
            onRemove={() => setPlayers((prev) => prev.filter((p) => p.id !== player.id))}
          />
        ))}
      </div>
    </div>
  );
}
