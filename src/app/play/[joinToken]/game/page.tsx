import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameView } from "./game-view";

export default async function PlayerGamePage({
  params,
}: {
  params: Promise<{ joinToken: string }>;
}) {
  const { joinToken } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/play/${joinToken}`);

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("join_token", joinToken)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!player) redirect(`/play/${joinToken}`);

  const [{ data: role }, { data: game }, { data: rounds }, { data: goals }, { data: effects }, { data: messages }] =
    await Promise.all([
      player.role_id
        ? supabase.from("roles").select("*").eq("id", player.role_id).single()
        : Promise.resolve({ data: null }),
      supabase.from("games").select("*").eq("id", player.game_id).single(),
      supabase.from("rounds").select("*").eq("game_id", player.game_id).order("position"),
      supabase.rpc("get_visible_goals", { p_player_id: player.id }),
      supabase
        .from("player_effects")
        .select("*, effect_templates(*)")
        .eq("player_id", player.id)
        .eq("active", true)
        .order("applied_at", { ascending: false }),
      supabase
        .from("messages")
        .select("*")
        .eq("game_id", player.game_id)
        .or(`player_id.eq.${player.id},player_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (!game) redirect(`/play/${joinToken}`);

  return (
    <GameView
      player={player}
      role={role}
      game={game}
      initialRounds={rounds ?? []}
      initialGoals={goals ?? []}
      initialEffects={effects ?? []}
      initialMessages={messages ?? []}
    />
  );
}
