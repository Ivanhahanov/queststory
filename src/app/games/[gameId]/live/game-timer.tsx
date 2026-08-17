"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Game } from "@/lib/types";

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function GameTimer({ game, onChange }: { game: Game; onChange: (game: Game) => void }) {
  const supabase = useSupabaseClient();
  const running = !!game.timer_started_at;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = running
    ? game.timer_elapsed_seconds + Math.floor((now - new Date(game.timer_started_at!).getTime()) / 1000)
    : game.timer_elapsed_seconds;

  async function start() {
    const { data } = await supabase
      .from("games")
      .update({ timer_started_at: new Date().toISOString(), timer_paused_at: null, status: "active" })
      .eq("id", game.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  async function pause() {
    const total = game.timer_elapsed_seconds + Math.floor((Date.now() - new Date(game.timer_started_at!).getTime()) / 1000);
    const { data } = await supabase
      .from("games")
      .update({
        timer_started_at: null,
        timer_paused_at: new Date().toISOString(),
        timer_elapsed_seconds: total,
        status: "paused",
      })
      .eq("id", game.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  async function reset() {
    const { data } = await supabase
      .from("games")
      .update({ timer_started_at: null, timer_paused_at: null, timer_elapsed_seconds: 0 })
      .eq("id", game.id)
      .select()
      .single();
    if (data) onChange(data);
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Время игры</p>
          <p className="font-mono text-3xl font-semibold tabular-nums">{formatElapsed(elapsed)}</p>
        </div>
        <div className="flex gap-2">
          {running ? (
            <Button variant="outline" onClick={pause}>
              <Pause /> Пауза
            </Button>
          ) : (
            <Button onClick={start}>
              <Play /> {game.timer_elapsed_seconds > 0 ? "Продолжить" : "Начать"}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={reset} title="Сбросить">
            <RotateCcw />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
