import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/games/${game.id}/constructor`} />}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{game.title}</h1>
            <p className="text-sm text-muted-foreground">Раздача ролей</p>
          </div>
        </div>
        <Button nativeButton={false} render={<Link href={`/games/${game.id}/live`} />}>
          <Radio /> Живая игра
        </Button>
      </div>

      <DistributeShell gameId={game.id} initialRoles={roles ?? []} initialPlayers={players ?? []} />
    </div>
  );
}
