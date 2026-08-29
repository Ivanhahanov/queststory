import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CommonGoalCard({ commonGoal }: { commonGoal: string }) {
  if (!commonGoal) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-start gap-2.5">
        <Target className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium text-primary">Общая цель</p>
          <p className="whitespace-pre-line text-sm">{commonGoal}</p>
        </div>
      </CardContent>
    </Card>
  );
}
