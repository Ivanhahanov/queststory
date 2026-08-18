import { createClient } from "@/lib/supabase/server";
import { CreateGameDialog } from "./create-game-dialog";
import { GamesList } from "./games-list";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("games")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Мои игры</h1>
        <CreateGameDialog />
      </div>

      <GamesList initialGames={games ?? []} />
    </div>
  );
}
