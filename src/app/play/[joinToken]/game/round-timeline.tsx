import { cn } from "@/lib/utils";
import type { Round } from "@/lib/types";

export function RoundTimeline({
  rounds,
  currentRoundId,
}: {
  rounds: Round[];
  currentRoundId: string | null;
}) {
  if (rounds.length === 0) return null;

  const sorted = [...rounds].sort((a, b) => a.position - b.position);
  const currentIndex = sorted.findIndex((r) => r.id === currentRoundId);

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {sorted.map((round, i) => {
        const state = currentIndex === -1 ? "pending" : i < currentIndex ? "past" : i === currentIndex ? "current" : "pending";
        return (
          <div
            key={round.id}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap",
              state === "current" && "border-primary bg-primary/15 text-primary",
              state === "past" && "border-border/60 text-muted-foreground line-through",
              state === "pending" && "border-border/60 text-muted-foreground",
            )}
          >
            {round.name}
          </div>
        );
      })}
    </div>
  );
}
