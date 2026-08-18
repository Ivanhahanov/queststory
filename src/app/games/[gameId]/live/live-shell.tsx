"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import type {
  ActivityTemplate,
  EffectTemplate,
  Game,
  Goal,
  Message,
  Player,
  PlayerEffect,
  PlayerGoalProgress,
  Role,
  Round,
} from "@/lib/types";
import { GameTimer } from "./game-timer";
import { LiveRoundTimeline } from "./live-round-timeline";
import { PlayerGrid } from "./player-grid";
import { PlayerDrawer } from "./player-drawer";
import { ActivitiesPanel } from "./activities-panel";

export function LiveShell({
  game: initialGame,
  rounds,
  roles,
  initialPlayers,
  goals,
  initialProgress,
  effectTemplates,
  initialPlayerEffects,
  activityTemplates,
  initialMessages,
}: {
  game: Game;
  rounds: Round[];
  roles: Role[];
  initialPlayers: Player[];
  goals: Goal[];
  initialProgress: PlayerGoalProgress[];
  effectTemplates: EffectTemplate[];
  initialPlayerEffects: PlayerEffect[];
  activityTemplates: ActivityTemplate[];
  initialMessages: Message[];
}) {
  const supabase = useSupabaseClient();
  const [game, setGame] = useState(initialGame);
  const [players, setPlayers] = useState(initialPlayers);
  const [progress, setProgress] = useState(initialProgress);
  const [playerEffects, setPlayerEffects] = useState(initialPlayerEffects);
  const [messages, setMessages] = useState(initialMessages);
  const [onlinePlayerIds, setOnlinePlayerIds] = useState<Set<string>>(new Set());
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`live-${game.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `game_id=eq.${game.id}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setPlayers((prev) => prev.filter((p) => p.id !== (payload.old as Player).id));
            return;
          }
          const row = payload.new as Player;
          setPlayers((prev) => (prev.some((p) => p.id === row.id) ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row]));
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "player_goal_progress" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const old = payload.old as PlayerGoalProgress;
          setProgress((prev) => prev.filter((p) => p.id !== old.id));
          return;
        }
        const row = payload.new as PlayerGoalProgress;
        setProgress((prev) => (prev.some((p) => p.id === row.id) ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "player_effects" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const old = payload.old as PlayerEffect;
          setPlayerEffects((prev) => prev.filter((p) => p.id !== old.id));
          return;
        }
        const row = payload.new as PlayerEffect;
        setPlayerEffects((prev) => (prev.some((p) => p.id === row.id) ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row]));
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `game_id=eq.${game.id}` },
        (payload) => setMessages((prev) => [payload.new as Message, ...prev]),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${game.id}` },
        (payload) => setGame(payload.new as Game),
      )
      .subscribe();

    const presence = supabase.channel(`presence:game-${game.id}`);
    presence
      .on("presence", { event: "sync" }, () => {
        setOnlinePlayerIds(new Set(Object.keys(presence.presenceState())));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presence);
    };
  }, [game.id, supabase]);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  return (
    <div className="space-y-5">
      <GameTimer game={game} onChange={setGame} />
      <LiveRoundTimeline game={game} rounds={rounds} onChange={setGame} />

      <ActivitiesPanel
        gameId={game.id}
        activityTemplates={activityTemplates}
        players={players}
        goals={goals}
        onGoalCompleted={(playerId, goalId) =>
          setProgress((prev) => {
            const existing = prev.find((p) => p.player_id === playerId && p.goal_id === goalId);
            const row: PlayerGoalProgress = existing
              ? { ...existing, completed: true, completed_at: new Date().toISOString() }
              : {
                  id: crypto.randomUUID(),
                  player_id: playerId,
                  goal_id: goalId,
                  completed: true,
                  completed_at: new Date().toISOString(),
                  completed_by: null,
                };
            return existing ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row];
          })
        }
      />

      <PlayerGrid
        players={players}
        roles={roles}
        goals={goals}
        progress={progress}
        playerEffects={playerEffects}
        effectTemplates={effectTemplates}
        onlinePlayerIds={onlinePlayerIds}
        onSelect={setSelectedPlayerId}
      />

      <PlayerDrawer
        player={selectedPlayer}
        role={selectedPlayer ? roles.find((r) => r.id === selectedPlayer.role_id) ?? null : null}
        goals={goals}
        progress={progress}
        effectTemplates={effectTemplates}
        playerEffects={playerEffects}
        messages={messages}
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayerId(null)}
        onProgressChange={(row) =>
          setProgress((prev) => (prev.some((p) => p.id === row.id) ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row]))
        }
        onMessageSent={(row) => setMessages((prev) => [row, ...prev])}
        onEffectApplied={(row) => setPlayerEffects((prev) => [...prev, row])}
      />
    </div>
  );
}
