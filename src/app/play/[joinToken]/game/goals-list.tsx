"use client";

import { CheckCircle2, Circle, Lock } from "lucide-react";
import { useSupabaseClient } from "@/hooks/use-supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VisibleGoal } from "@/lib/types";

export function GoalsList({
  playerId,
  goals,
  lockedGoalIds,
}: {
  playerId: string;
  goals: VisibleGoal[];
  lockedGoalIds: Set<string | null>;
}) {
  const supabase = useSupabaseClient();

  async function toggle(goal: VisibleGoal) {
    await supabase.from("player_goal_progress").upsert(
      {
        player_id: playerId,
        goal_id: goal.id,
        completed: !goal.completed,
        completed_at: !goal.completed ? new Date().toISOString() : null,
      },
      { onConflict: "player_id,goal_id" },
    );
    // realtime (player_goal_progress subscription in game-view.tsx) refetches visible goals
  }

  if (goals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Целей пока нет</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Мои цели</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {goals.map((goal) => {
          const locked = lockedGoalIds.has(goal.id);
          const interactive = goal.player_can_complete && !locked;
          return (
            <div
              key={goal.id}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={interactive ? () => toggle(goal) : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(goal);
                      }
                    }
                  : undefined
              }
              className={cn(
                "flex w-full min-h-11 items-start gap-2.5 rounded-lg p-2 text-left",
                goal.completed && "opacity-60",
                locked && "opacity-50",
                interactive && "cursor-pointer transition-colors hover:bg-muted/50 active:scale-[0.99]",
              )}
            >
              {locked ? (
                <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              ) : goal.completed ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", goal.completed && "line-through")}>{goal.title}</p>
                {goal.description && !locked && (
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                )}
                {locked && <p className="text-xs text-muted-foreground">Временно заблокировано</p>}
                {interactive && !goal.completed && (
                  <p className="text-xs text-primary">Нажмите, когда выполните</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
