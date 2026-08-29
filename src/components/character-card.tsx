import { Target } from "lucide-react";
import { dicebearUrl } from "@/lib/dicebear";
import { parseAvatarOptions } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type CardGoal = { id: string; title: string; description: string };

export type CardFrame = "none" | "fantasy" | "noir" | "scifi";

function Portrait({ role, frame }: { role: Role; frame: CardFrame }) {
  const src = role.portrait_url || dicebearUrl(role.avatar_style, role.avatar_seed, parseAvatarOptions(role.avatar_options));
  const objectFit = role.portrait_url ? "object-cover" : "object-contain bg-muted";
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={role.name} className={cn("aspect-[3/4] w-full object-top", objectFit)} />
  );

  if (frame === "fantasy") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-700 to-amber-200 p-[3px] shadow-lg">
        <div className="overflow-hidden rounded-[14px] ring-1 ring-white/25">{img}</div>
      </div>
    );
  }

  if (frame === "noir") {
    return (
      <div className="rounded-lg bg-black p-3 shadow-lg ring-1 ring-white/10">
        <div className="overflow-hidden rounded-sm [filter:grayscale(0.15)_contrast(1.05)]">{img}</div>
      </div>
    );
  }

  if (frame === "scifi") {
    return (
      <div className="relative rounded-xl bg-primary/10 p-1">
        <div className="overflow-hidden rounded-lg">{img}</div>
        {(["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"] as const).map(
          (pos) => (
            <span
              key={pos}
              className={cn(
                "absolute size-6 border-t-2 border-l-2 border-primary",
                pos,
              )}
            />
          ),
        )}
      </div>
    );
  }

  return <div className="overflow-hidden rounded-2xl shadow-lg">{img}</div>;
}

export function CharacterCard({
  game,
  role,
  goals,
}: {
  game: { story_synopsis: string; common_goal: string; card_frame: string };
  role: Role;
  goals: CardGoal[];
}) {
  const frame = (["none", "fantasy", "noir", "scifi"] as const).includes(game.card_frame as CardFrame)
    ? (game.card_frame as CardFrame)
    : "none";

  return (
    <div className="mx-auto w-full max-w-sm space-y-5">
      <Portrait role={role} frame={frame} />

      <div className="space-y-4 text-left">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">{role.name}</h2>
        </div>

        {role.description && (
          <div>
            <p className="whitespace-pre-line text-sm">{role.description}</p>
          </div>
        )}

        {(game.story_synopsis || game.common_goal) && (
          <div className="space-y-3 rounded-xl border border-border/60 bg-card p-3.5">
            {game.story_synopsis && (
              <div className="space-y-1">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">История</h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{game.story_synopsis}</p>
              </div>
            )}
            {game.common_goal && (
              <div className="space-y-1">
                <h3 className="text-xs font-medium tracking-wide text-primary uppercase">Общая цель</h3>
                <p className="whitespace-pre-line text-sm">{game.common_goal}</p>
              </div>
            )}
          </div>
        )}

        {goals.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Цели персонажа</h3>
            <div className="space-y-1.5">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-2 rounded-lg bg-muted/60 p-2.5">
                  <Target className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{goal.title}</p>
                    {goal.description && <p className="text-xs text-muted-foreground">{goal.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
