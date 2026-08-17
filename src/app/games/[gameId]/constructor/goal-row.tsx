"use client";

import { Trash2 } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Goal, Round } from "@/lib/types";

const FROM_START = "start";

export function GoalRow({
  goal,
  rounds,
  onChange,
  onRemove,
}: {
  goal: Goal;
  rounds: Round[];
  onChange: (goal: Goal) => void;
  onRemove: () => void;
}) {
  const supabase = useSupabaseClient();

  async function patch(update: Partial<Goal>) {
    const { data } = await supabase.from("goals").update(update).eq("id", goal.id).select().single();
    if (data) onChange(data);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/60 p-3">
      <div className="flex gap-2">
        <Input
          defaultValue={goal.title}
          placeholder="Название цели"
          onBlur={(e) => patch({ title: e.target.value })}
          className="flex-1"
        />
        <Select
          value={goal.unlock_round_id ?? FROM_START}
          onValueChange={(v) => patch({ unlock_round_id: v === FROM_START ? null : v })}
        >
          <SelectTrigger className="w-44 shrink-0">
            <SelectValue placeholder="Раунд открытия">
              {(value: string) =>
                value === FROM_START ? "С начала игры" : `С «${rounds.find((r) => r.id === value)?.name ?? value}»`
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FROM_START}>С начала игры</SelectItem>
            {rounds.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                С «{r.name}»
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      <Textarea
        defaultValue={goal.description}
        placeholder="Что именно должен сделать игрок"
        rows={2}
        onBlur={(e) => patch({ description: e.target.value })}
      />
    </div>
  );
}
