"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityTemplate, Goal } from "@/lib/types";
import { ActivityCard } from "./activity-card";

export function ActivitiesTab({ gameId, goals }: { gameId: string; goals: Goal[] }) {
  const supabase = useSupabaseClient();
  const [activities, setActivities] = useState<ActivityTemplate[] | null>(null);

  useEffect(() => {
    supabase
      .from("activity_templates")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at")
      .then(({ data }) => setActivities(data ?? []));
  }, [gameId, supabase]);

  async function addActivity() {
    const { data } = await supabase
      .from("activity_templates")
      .insert({ game_id: gameId, name: "Новая активность", type: "pin_code" })
      .select()
      .single();
    if (data) setActivities((prev) => [...(prev ?? []), data]);
  }

  async function removeActivity(id: string) {
    setActivities((prev) => (prev ?? []).filter((a) => a.id !== id));
    await supabase.from("activity_templates").delete().eq("id", id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Общие активности</h2>
          <p className="text-sm text-muted-foreground">
            Проверки, которые ведущий запускает во время игры: PIN-код сейфа, фото находки, групповое голосование.
          </p>
        </div>
        <Button onClick={addActivity}>
          <Plus /> Добавить активность
        </Button>
      </div>

      {activities === null && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {activities?.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Активностей пока нет
            </CardTitle>
            <CardDescription>Добавьте, например, ввод кода от сейфа или фото находки на подтверждение.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {activities?.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            goals={goals}
            onChange={(updated) =>
              setActivities((prev) => (prev ?? []).map((a) => (a.id === updated.id ? updated : a)))
            }
            onRemove={() => removeActivity(activity.id)}
          />
        ))}
      </div>
    </div>
  );
}
