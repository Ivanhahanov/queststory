import { BookOpen, Target } from "lucide-react";
import { roleAvatarUrl } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type CardGoal = { id: string; title: string; description: string };

export type CardFrame = "none" | "fantasy" | "noir" | "scifi";

// Соотношение сторон портрета — используется и здесь, и в кроп-редакторе
// при загрузке фото, чтобы кадрирование совпадало с тем, что видно в карточке.
export const PORTRAIT_ASPECT = 3 / 4;

// Стиль оформления применяется ко всей карточке целиком (фон, рамка,
// плашка с именем), а не только к портрету — иначе рамка вокруг фото
// смотрится приклеенной поверх обычного текстового блока снизу.
// Тени намеренно не используются: карточка живёт внутри скроллящегося
// Dialog, а overflow-y:auto на родителе обрезает box-shadow, вылезающий
// за границы блока.
const CARD_THEME: Record<
  CardFrame,
  { outer: string; surface: string; caption: string; heading: string; name: string }
> = {
  none: {
    outer: "",
    surface: "border border-border/60 bg-card",
    caption: "border-t border-border/60 bg-card",
    heading: "text-muted-foreground",
    name: "text-foreground",
  },
  fantasy: {
    outer: "bg-gradient-to-br from-amber-200 via-yellow-700 to-amber-200 p-[3px]",
    surface: "bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 ring-1 ring-amber-200/15",
    caption: "bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-800",
    heading: "text-amber-400/90",
    name: "text-amber-50",
  },
  noir: {
    outer: "bg-gradient-to-b from-white/25 via-white/10 to-white/25 p-px",
    surface: "bg-neutral-950 ring-1 ring-white/10",
    caption: "border-t border-white/15 bg-black",
    heading: "text-neutral-400",
    name: "text-white",
  },
  scifi: {
    outer: "bg-primary/25 p-px",
    surface: "bg-neutral-950 ring-1 ring-primary/30",
    caption: "border-t border-primary/40 bg-neutral-950",
    heading: "text-primary",
    name: "text-primary",
  },
};

function FrameCorners({ frame }: { frame: CardFrame }) {
  if (frame !== "scifi") return null;
  return (
    <>
      {(["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"] as const).map(
        (pos) => (
          <span key={pos} className={cn("pointer-events-none absolute z-10 size-6 border-t-2 border-l-2 border-primary", pos)} />
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
  const theme = CARD_THEME[frame];

  return (
    <div className={cn("relative mx-auto w-full max-w-sm rounded-2xl", theme.outer)}>
      <div className={cn("overflow-hidden rounded-[inherit]", theme.surface)}>
        {/* Персонаж должен быть виден сразу при открытии карточки */}
        <div className={frame === "noir" ? "[filter:grayscale(0.15)_contrast(1.05)]" : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={roleAvatarUrl(role)} alt={role.name} className="aspect-[3/4] w-full object-cover object-top" />
        </div>
        <div className={cn("p-4", theme.caption)}>
          <h2 className={cn("text-2xl font-bold", theme.name)}>{role.name}</h2>
        </div>

        <div className="space-y-5 p-4">
          {game.story_synopsis && (
            <div className="space-y-1">
              <h3 className={cn("flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase", theme.heading)}>
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
              <h3 className={cn("text-xs font-medium tracking-wide uppercase", theme.heading)}>О персонаже</h3>
              <p className="whitespace-pre-line text-sm">{role.description}</p>
            </div>
          )}

          {goals.length > 0 && (
            <div className="space-y-2">
              <h3 className={cn("text-xs font-medium tracking-wide uppercase", theme.heading)}>Цели персонажа</h3>
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
      <FrameCorners frame={frame} />
    </div>
  );
}
