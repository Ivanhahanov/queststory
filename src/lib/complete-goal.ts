import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Common activities (PIN/vote/photo) represent a shared story beat, so success
 * marks the linked goal complete for every player currently in the game.
 */
export async function completeGoalForAllPlayers(
  supabase: SupabaseClient<Database>,
  gameId: string,
  goalId: string,
) {
  const { data: players } = await supabase.from("players").select("id").eq("game_id", gameId);
  if (!players?.length) return;

  await supabase.from("player_goal_progress").upsert(
    players.map((p) => ({
      player_id: p.id,
      goal_id: goalId,
      completed: true,
      completed_at: new Date().toISOString(),
    })),
    { onConflict: "player_id,goal_id" },
  );
}
