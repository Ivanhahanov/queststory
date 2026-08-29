import { BookOpen, Target } from "lucide-react";
import { roleAvatarUrl } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type CardGoal = { id: string; title: string; description: string };

export type CardFrame = "none" | "fantasy" | "noir" | "scifi";

// Соотношение сторон портрета — используется и здесь, и в кроп-редакторе
// при загрузке фото, чтобы кадрирование совпадало с тем, что видно в карточке.
export const PORTRAIT_ASPECT = 3 / 4;

const frameOuter: Record<CardFrame, string> = {
  none: "",
  fantasy: "bg-gradient-to-br from-amber-200 via-yellow-700 to-amber-200 p-[3px] shadow-lg",
  noir: "bg-black p-3 shadow-lg ring-1 ring-white/10",
  scifi: "bg-primary/10 p-1",
};

function FrameCorners({ frame }: { frame: CardFrame }) {
  if (frame !== "scifi") return null;
  return (
    <>
      {(["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"] as const).map(
        (pos) => (
          <span key={pos} className={cn("absolute size-6 border-t-2 border-l-2 border-primary", pos)} />
        ),
      )}
    </>
  );
}

function normalizeFrame(value: string): CardFrame {
  return (["none", "fantasy", "noir", "scifi"] as const).includes(value as CardFrame) ? (value as CardFrame) : "none";
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
  const frame = normalizeFrame(game.card_frame);

  return (
    <div className="mx-auto w-full max-w-sm space-y-5">
      {/* Персонаж должен быть виден сразу при открытии карточки */}
      <div className={cn("relative overflow-hidden rounded-2xl", frameOuter[frame])}>
        <div className="relative overflow-hidden rounded-[inherit]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={roleAvatarUrl(role)}
            alt={role.name}
            className={cn(
              "aspect-[3/4] w-full object-cover object-top",
              frame === "noir" && "[filter:grayscale(0.15)_contrast(1.05)]",
            )}
          />
          <div className="bg-black/85 p-4">
            <h2 className="text-2xl font-bold text-white">{role.name}</h2>
          </div>
        </div>
        <FrameCorners frame={frame} />
      </div>

      {game.story_synopsis && (
        <div className="space-y-1">
          <h3 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <BookOpen className="size-3.5" /> История
          </h3>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{game.story_synopsis}</p>
        </div>
      )}

      {game.common_goal && (
        <div className="space-y-1">
          <h3 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-primary uppercase">
            <Target className="size-3.5" /> Общая цель
          </h3>
          <p className="whitespace-pre-line text-sm">{game.common_goal}</p>
        </div>
      )}

      {role.description && (
        <div className="space-y-1">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">О персонаже</h3>
          <p className="whitespace-pre-line text-sm">{role.description}</p>
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
  );
}
