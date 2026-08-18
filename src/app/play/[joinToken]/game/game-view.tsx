"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { gameThemeStyle } from "@/lib/theme-color";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { InstallAppBanner } from "@/components/install-app-banner";
import type {
  Game,
  Message,
  PlayerEffectWithTemplate,
  Player,
  Role,
  Round,
  VisibleGoal,
} from "@/lib/types";
import { RoleHeader } from "./role-header";
import { StorySection } from "./story-section";
import { RoundTimeline } from "./round-timeline";
import { GoalsList } from "./goals-list";
import { EffectsList } from "./effects-list";
import { MessagesFeed } from "./messages-feed";
import { PersonalActivities } from "./personal-activities";
import { LeaveGameButton } from "./leave-game-button";
import { NotificationsBanner } from "./notifications-banner";

export function GameView({
  player,
  role,
  game: initialGame,
  initialRounds,
  initialGoals,
  initialEffects,
  initialMessages,
}: {
  player: Player;
  role: Role | null;
  game: Game;
  initialRounds: Round[];
  initialGoals: VisibleGoal[];
  initialEffects: PlayerEffectWithTemplate[];
  initialMessages: Message[];
}) {
  const supabase = useSupabaseClient();
  const [game, setGame] = useState(initialGame);
  const [goals, setGoals] = useState(initialGoals);
  const [effects, setEffects] = useState(initialEffects);
  const [messages, setMessages] = useState(initialMessages);
  const currentRoundIdRef = useRef(initialGame.current_round_id);

  async function refetchGoals() {
    const { data } = await supabase.rpc("get_visible_goals", { p_player_id: player.id });
    if (data) setGoals(data);
  }

  async function refetchEffects() {
    const { data } = await supabase
      .from("player_effects")
      .select("*, effect_templates(*)")
      .eq("player_id", player.id)
      .eq("active", true)
      .order("applied_at", { ascending: false });
    if (data) setEffects(data);
  }

  useEffect(() => {
    const channel = supabase
      .channel(`player-${player.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${game.id}` },
        (payload) => {
          const updated = payload.new as Game;
          const roundChanged = updated.current_round_id !== currentRoundIdRef.current;
          currentRoundIdRef.current = updated.current_round_id;
          setGame(updated);
          if (roundChanged) {
            refetchGoals();
            toast("Начался новый раунд", { description: "Проверьте список целей." });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player_goal_progress", filter: `player_id=eq.${player.id}` },
        () => refetchGoals(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player_effects", filter: `player_id=eq.${player.id}` },
        (payload) => {
          refetchEffects();
          if (payload.eventType === "INSERT") {
            toast("Ведущий применил эффект", { description: "Загляните в раздел «Эффекты»." });
            navigator.vibrate?.(200);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `game_id=eq.${game.id}` },
        (payload) => {
          const message = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            toast("Новое сообщение от ведущего", { description: message.body });
            navigator.vibrate?.(200);
            return [message, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // refetchGoals/refetchEffects close over stable ids; re-subscribing on every
    // render would tear down and recreate the realtime channel unnecessarily.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id, player.id, supabase]);

  useEffect(() => {
    const presence = supabase.channel(`presence:game-${game.id}`, {
      config: { presence: { key: player.id } },
    });
    presence.subscribe((status) => {
      if (status === "SUBSCRIBED") presence.track({ online_at: Date.now() });
    });
    return () => {
      supabase.removeChannel(presence);
    };
  }, [game.id, player.id, supabase]);

  const lockedGoalIds = new Set(
    effects.filter((e) => e.effect_templates?.type === "goal_lock" && e.target_goal_id).map((e) => e.target_goal_id),
  );
  const points = effects
    .filter((e) => e.effect_templates?.type === "points")
    .reduce((sum, e) => sum + (e.value ?? 0), 0);

  return (
    <div style={gameThemeStyle(game.accent_color)} className="mx-auto max-w-lg space-y-5 p-4 pb-16">
      <ThemeColorSync color={game.accent_color} />
      <RoleHeader role={role} displayName={player.display_name} points={points} />
      <InstallAppBanner />
      <NotificationsBanner playerId={player.id} />
      <StorySection game={game} />
      <RoundTimeline rounds={initialRounds} currentRoundId={game.current_round_id} />
      <EffectsList effects={effects} />
      <PersonalActivities gameId={game.id} playerId={player.id} />
      <GoalsList playerId={player.id} goals={goals} lockedGoalIds={lockedGoalIds} />
      <MessagesFeed messages={messages} />
      <div className="flex justify-center pt-2">
        <LeaveGameButton player={player} />
      </div>
    </div>
  );
}
