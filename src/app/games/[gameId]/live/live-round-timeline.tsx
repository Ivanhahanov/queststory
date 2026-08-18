"use client";

import { useSupabaseClient } from "@/hooks/use-supabase";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Game, Round } from "@/lib/types";

export function LiveRoundTimeline({
  game,
  rounds,
  onChange,
}: {
  game: Game;
  rounds: Round[];
  onChange: (game: Game) => void;
}) {
  const supabase = useSupabaseClient();
  if (rounds.length === 0) return null;

  const sorted = [...rounds].sort((a, b) => a.position - b.position);

  async function setRound(roundId: string) {
    const { data } = await supabase
      .from("games")
      .update({ current_round_id: roundId })
      .eq("id", game.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  return (
    <Card>
      <CardContent className="flex gap-2 overflow-x-auto">
        {sorted.map((round) => {
          const active = round.id === game.current_round_id;
          return (
            <button
              key={round.id}
              onClick={() => setRound(round.id)}
              className={cn(
                "flex h-11 shrink-0 items-center rounded-lg border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {round.name}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
