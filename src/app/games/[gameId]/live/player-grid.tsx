import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { EffectTemplate, Goal, Player, PlayerEffect, PlayerGoalProgress, Role } from "@/lib/types";
import { PlayerCard } from "./player-card";

export function PlayerGrid({
  players,
  roles,
  goals,
  progress,
  playerEffects,
  effectTemplates,
  onlinePlayerIds,
  onSelect,
}: {
  players: Player[];
  roles: Role[];
  goals: Goal[];
  progress: PlayerGoalProgress[];
  playerEffects: PlayerEffect[];
  effectTemplates: EffectTemplate[];
  onlinePlayerIds: Set<string>;
  onSelect: (playerId: string) => void;
}) {
  if (players.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">Участников пока нет</CardTitle>
          <CardDescription>Раздайте роли на предыдущей странице.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          role={roles.find((r) => r.id === player.role_id) ?? null}
          goals={goals}
          progress={progress}
          effects={playerEffects.filter((e) => e.player_id === player.id)}
          effectTemplates={effectTemplates}
          online={onlinePlayerIds.has(player.id)}
          onClick={() => onSelect(player.id)}
        />
      ))}
    </div>
  );
}
