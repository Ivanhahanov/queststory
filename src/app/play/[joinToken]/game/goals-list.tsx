import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VisibleGoal } from "@/lib/types";

export function GoalsList({
  goals,
  lockedGoalIds,
}: {
  goals: VisibleGoal[];
  lockedGoalIds: Set<string | null>;
}) {
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
          return (
            <div
              key={goal.id}
              className={cn(
                "flex items-start gap-2.5 rounded-lg p-2",
                goal.completed && "opacity-60",
                locked && "opacity-50",
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
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
