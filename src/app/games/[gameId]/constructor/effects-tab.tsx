"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EffectTemplate } from "@/lib/types";
import { EffectCard } from "./effect-card";

export function EffectsTab({ gameId }: { gameId: string }) {
  const supabase = useSupabaseClient();
  const [effects, setEffects] = useState<EffectTemplate[] | null>(null);

  useEffect(() => {
    supabase
      .from("effect_templates")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at")
      .then(({ data }) => setEffects(data ?? []));
  }, [gameId, supabase]);

  async function addEffect() {
    const { data } = await supabase
      .from("effect_templates")
      .insert({ game_id: gameId, name: "Новый эффект", type: "status_label" })
      .select()
      .single();
    if (data) setEffects((prev) => [...(prev ?? []), data]);
  }

  async function removeEffect(id: string) {
    setEffects((prev) => (prev ?? []).filter((e) => e.id !== id));
    await supabase.from("effect_templates").delete().eq("id", id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Эффекты</h2>
          <p className="text-sm text-muted-foreground">
            Шаблоны, которые ведущий сможет накладывать на игроков во время игры одной кнопкой.
          </p>
        </div>
        <Button onClick={addEffect}>
          <Plus /> Добавить эффект
        </Button>
      </div>

      {effects === null && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {effects?.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Эффектов пока нет
            </CardTitle>
            <CardDescription>
              Например: «Ранен», «Секретная подсказка», «Заморозка цели», «Бонусные очки».
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {effects?.map((effect) => (
          <EffectCard
            key={effect.id}
            effect={effect}
            onChange={(updated) =>
              setEffects((prev) => (prev ?? []).map((e) => (e.id === updated.id ? updated : e)))
            }
            onRemove={() => removeEffect(effect.id)}
          />
        ))}
      </div>
    </div>
  );
}
