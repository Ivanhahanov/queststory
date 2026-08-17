"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Round } from "@/lib/types";

export function RoundsTab({
  gameId,
  rounds,
  onChange,
}: {
  gameId: string;
  rounds: Round[];
  onChange: (rounds: Round[]) => void;
}) {
  const supabase = useSupabaseClient();
  const [busy, setBusy] = useState(false);

  async function addRound() {
    setBusy(true);
    const position = rounds.length ? Math.max(...rounds.map((r) => r.position)) + 1 : 0;
    const { data } = await supabase
      .from("rounds")
      .insert({ game_id: gameId, position, name: `Раунд ${rounds.length + 1}` })
      .select()
      .single();
    if (data) onChange([...rounds, data]);
    setBusy(false);
  }

  async function updateRound(id: string, patch: Partial<Round>) {
    onChange(rounds.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("rounds").update(patch).eq("id", id);
  }

  async function removeRound(id: string) {
    onChange(rounds.filter((r) => r.id !== id));
    await supabase.from("rounds").delete().eq("id", id);
  }

  async function swap(a: Round, b: Round) {
    onChange(
      rounds
        .map((r) => {
          if (r.id === a.id) return { ...r, position: b.position };
          if (r.id === b.id) return { ...r, position: a.position };
          return r;
        })
        .sort((x, y) => x.position - y.position),
    );
    await Promise.all([
      supabase.from("rounds").update({ position: b.position }).eq("id", a.id),
      supabase.from("rounds").update({ position: a.position }).eq("id", b.id),
    ]);
  }

  const sorted = [...rounds].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Раунды</h2>
          <p className="text-sm text-muted-foreground">
            Цели можно привязать к раунду — тогда они откроются игроку только когда ведущий переключит игру на этот раунд.
          </p>
        </div>
        <Button onClick={addRound} disabled={busy}>
          <Plus /> Добавить раунд
        </Button>
      </div>

      {sorted.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Раундов пока нет
            </CardTitle>
            <CardDescription>Без раундов все цели будут доступны сразу с начала игры.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((round, i) => (
          <Card key={round.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={i === 0}
                    onClick={() => swap(round, sorted[i - 1])}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={i === sorted.length - 1}
                    onClick={() => swap(round, sorted[i + 1])}
                  >
                    <ArrowDown />
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-1">
                    <Label className="sr-only">Название</Label>
                    <Input
                      defaultValue={round.name}
                      onBlur={(e) => updateRound(round.id, { name: e.target.value })}
                      placeholder="Название раунда"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="sr-only">Длительность, мин</Label>
                    <Input
                      type="number"
                      min={0}
                      className="w-28"
                      defaultValue={
                        round.planned_duration_seconds
                          ? Math.round(round.planned_duration_seconds / 60)
                          : ""
                      }
                      placeholder="Мин."
                      onBlur={(e) =>
                        updateRound(round.id, {
                          planned_duration_seconds: e.target.value
                            ? Number(e.target.value) * 60
                            : null,
                        })
                      }
                    />
                  </div>
                </div>
                <Textarea
                  defaultValue={round.description}
                  onBlur={(e) => updateRound(round.id, { description: e.target.value })}
                  placeholder="Что происходит в этом раунде (заметка для себя)"
                  rows={2}
                />
              </div>

              <Button variant="ghost" size="icon" onClick={() => removeRound(round.id)}>
                <Trash2 />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
