import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DistributeShell } from "./distribute-shell";

export default async function DistributePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const supabase = await createClient();

  const [{ data: game }, { data: roles }, { data: players }] = await Promise.all([
    supabase.from("games").select("*").eq("id", gameId).single(),
    supabase.from("roles").select("*").eq("game_id", gameId).order("created_at"),
    supabase.from("players").select("*").eq("game_id", gameId).order("created_at"),
  ]);

  if (!game) notFound();

  return <DistributeShell gameId={game.id} initialRoles={roles ?? []} initialPlayers={players ?? []} />;
}
