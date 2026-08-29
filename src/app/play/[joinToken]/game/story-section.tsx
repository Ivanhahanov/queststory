import { BookOpen, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Game } from "@/lib/types";

export function StorySection({ game }: { game: Game }) {
  if (!game.story_synopsis && !game.common_goal) return null;

  return (
    <div className="space-y-3">
      {game.story_synopsis && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <BookOpen className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">История</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-line text-sm">{game.story_synopsis}</CardContent>
        </Card>
      )}
      {game.common_goal && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Target className="size-4 text-primary" />
            <CardTitle className="text-sm font-medium text-primary">Общая цель</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-line text-sm">{game.common_goal}</CardContent>
        </Card>
      )}
    </div>
  );
}
