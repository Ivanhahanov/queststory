import { createClient } from "@/lib/supabase/server";
import { assertFound } from "@/lib/supabase/assert-found";
import { ConstructorShell } from "./constructor-shell";

export default async function ConstructorPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const supabase = await createClient();

  const [{ data: game, error }, { data: rounds }, { data: roles }, { data: goals }] = await Promise.all([
    supabase.from("games").select("*").eq("id", gameId).single(),
    supabase.from("rounds").select("*").eq("game_id", gameId).order("position"),
    supabase.from("roles").select("*").eq("game_id", gameId).order("created_at"),
    supabase.from("goals").select("*").eq("game_id", gameId).order("position"),
  ]);

  assertFound(game, error);

  return (
    <ConstructorShell
      game={game}
      initialRounds={rounds ?? []}
      initialRoles={roles ?? []}
      initialGoals={goals ?? []}
    />
  );
}
