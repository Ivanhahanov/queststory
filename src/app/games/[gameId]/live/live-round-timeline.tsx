"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Game, Round } from "@/lib/types";

function formatMinutes(seconds: number) {
  return `${Math.round(seconds / 60)} мин`;
}

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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  if (rounds.length === 0) return null;

  const sorted = [...rounds].sort((a, b) => a.position - b.position);

  async function setRound(roundId: string) {
    const { data } = await supabase
      .from("games")
      .update({ current_round_id: roundId, current_round_started_at: new Date().toISOString() })
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
          const elapsedSeconds =
            active && game.current_round_started_at
              ? Math.floor((now - new Date(game.current_round_started_at).getTime()) / 1000)
              : 0;
          const overdue = active && !!round.planned_duration_seconds && elapsedSeconds > round.planned_duration_seconds;

          return (
            <button
              key={round.id}
              onClick={() => setRound(round.id)}
              className={cn(
                "flex shrink-0 flex-col items-start gap-0.5 rounded-lg border px-4 py-2 text-left whitespace-nowrap transition-colors",
                active && !overdue && "border-primary bg-primary/15 text-primary",
                active && overdue && "border-destructive bg-destructive/10 text-destructive",
                !active && "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span className="text-sm font-medium">{round.name}</span>
              {active && round.planned_duration_seconds ? (
                <span className="text-xs opacity-80">
                  прошло {formatMinutes(elapsedSeconds)} из {formatMinutes(round.planned_duration_seconds)}
                </span>
              ) : round.planned_duration_seconds ? (
                <span className="text-xs opacity-70">план {formatMinutes(round.planned_duration_seconds)}</span>
              ) : null}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
