"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GameCard } from "./game-card";

type GameSummary = { id: string; title: string; status: string; created_at: string };

export function GamesList({ initialGames }: { initialGames: GameSummary[] }) {
  const [games, setGames] = useState(initialGames);

  if (games.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">Пока нет ни одной квестории</CardTitle>
          <CardDescription>Создайте первую игру, чтобы начать конструктор ролей и целей.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.id} game={game} onDeleted={() => setGames((prev) => prev.filter((g) => g.id !== game.id))} />
      ))}
    </div>
  );
}
