import { createClient } from "@/lib/supabase/server";
import { assertFound } from "@/lib/supabase/assert-found";
import { LiveShell } from "./live-shell";

export default async function LivePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const supabase = await createClient();

  const [{ data: game, error }, { data: rounds }, { data: roles }, { data: players }, { data: goals }, { data: effectTemplates }, { data: activityTemplates }, { data: messages }] =
    await Promise.all([
      supabase.from("games").select("*").eq("id", gameId).single(),
      supabase.from("rounds").select("*").eq("game_id", gameId).order("position"),
      supabase.from("roles").select("*").eq("game_id", gameId).order("created_at"),
      supabase.from("players").select("*").eq("game_id", gameId).order("created_at"),
      supabase.from("goals").select("*").eq("game_id", gameId).order("position"),
      supabase.from("effect_templates").select("*").eq("game_id", gameId).order("created_at"),
      supabase.from("activity_templates").select("*").eq("game_id", gameId).order("created_at"),
      supabase.from("messages").select("*").eq("game_id", gameId).order("created_at", { ascending: false }),
    ]);

  assertFound(game, error);

  const playerIds = (players ?? []).map((p) => p.id);
  const [{ data: progress }, { data: playerEffects }] = await Promise.all([
    playerIds.length
      ? supabase.from("player_goal_progress").select("*").in("player_id", playerIds)
      : Promise.resolve({ data: [] }),
    playerIds.length
      ? supabase.from("player_effects").select("*").eq("active", true).in("player_id", playerIds)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <LiveShell
      game={game}
      rounds={rounds ?? []}
      roles={roles ?? []}
      initialPlayers={players ?? []}
      goals={goals ?? []}
      initialProgress={progress ?? []}
      effectTemplates={effectTemplates ?? []}
      initialPlayerEffects={playerEffects ?? []}
      activityTemplates={activityTemplates ?? []}
      initialMessages={messages ?? []}
    />
  );
}
