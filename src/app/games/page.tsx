import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateGameDialog } from "./create-game-dialog";

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  active: "Идёт игра",
  paused: "На паузе",
  finished: "Завершена",
};

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

      {!games?.length ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Пока нет ни одной квестории
            </CardTitle>
            <CardDescription>Создайте первую игру, чтобы начать конструктор ролей и целей.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}/constructor`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                    <Badge variant="secondary">{STATUS_LABEL[game.status] ?? game.status}</Badge>
                  </div>
                  <CardDescription>
                    {new Date(game.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
