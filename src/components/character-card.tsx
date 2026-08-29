import type { ComponentType } from "react";
import { PT_Serif } from "next/font/google";
import { BookOpen, ListChecks, Target, UserRound, XIcon } from "lucide-react";
import { roleAvatarUrl } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type CardGoal = { id: string; title: string; description: string };
type IconType = ComponentType<{ className?: string }>;

export type CardFrame = "none" | "fantasy" | "noir" | "scifi";

// Соотношение сторон портрета — используется и здесь, и в кроп-редакторе
// при загрузке фото, чтобы кадрирование совпадало с тем, что видно в карточке.
export const PORTRAIT_ASPECT = 3 / 4;

// Отдельный шрифт только для имени персонажа в fantasy-теме — задаёт
// "книжный" характер, не трогая шрифт всего остального интерфейса.
const ptSerif = PT_Serif({ weight: "700", subsets: ["cyrillic", "latin"] });

// Стиль оформления применяется ко всей карточке целиком (фон, рамка,
// плашка с именем, текстура), а не только к портрету — иначе рамка вокруг
// фото смотрится приклеенной поверх обычного текстового блока снизу.
// Тени намеренно не используются: карточка живёт внутри скроллящегося
// Dialog, а overflow-y:auto на родителе по спецификации CSS превращает
// overflow-x тоже в клиппинг-контекст — любой box-shadow срежет по краю.
// Inset-тени безопасны (не выходят за границы блока), background-image —
// тоже, поэтому текстура и виньетка сделаны именно так.
const CARD_THEME: Record<
  CardFrame,
  {
    outer: string;
    surface: string;
    caption: string;
    heading: string;
    name: string;
    close: string;
    texture?: React.CSSProperties;
  }
> = {
  none: {
    outer: "",
    surface: "border border-border/60 bg-card",
    caption: "border-t border-border/60 bg-card",
    heading: "text-muted-foreground",
    name: "text-foreground",
    close: "bg-background/80 text-foreground ring-1 ring-border hover:bg-background",
  },
  fantasy: {
    outer: "bg-gradient-to-br from-amber-200 via-yellow-700 to-amber-200 p-[3px]",
    surface: "bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 ring-1 ring-amber-200/15",
    caption: "border-t border-amber-100/20 bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-800",
    heading: "text-amber-400/90",
    name: cn("text-amber-50 tracking-wide", ptSerif.className),
    close: "bg-black/40 text-amber-100 ring-1 ring-amber-200/40 hover:bg-black/60",
    texture: { backgroundImage: "radial-gradient(ellipse 140% 55% at 50% 0%, rgba(251,191,36,0.10), transparent 62%)" },
  },
  noir: {
    outer: "bg-gradient-to-b from-white/25 via-white/10 to-white/25 p-px",
    surface: "bg-neutral-950 ring-1 ring-white/10",
    caption: "border-t border-white/15 bg-black",
    heading: "text-neutral-400",
    name: "text-white uppercase tracking-[0.15em]",
    close: "bg-black/60 text-white ring-1 ring-white/20 hover:bg-black/80",
    texture: {
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
    },
  },
  scifi: {
    outer: "bg-primary/25 p-px",
    surface: "bg-neutral-950 ring-1 ring-primary/30",
    caption: "border-t border-primary/40 bg-neutral-950",
    heading: "text-primary",
    name: "text-primary uppercase tracking-[0.2em]",
    close: "bg-neutral-950/70 text-primary ring-1 ring-primary/40 hover:bg-neutral-950/90",
    texture: {
      backgroundImage:
        "linear-gradient(color-mix(in srgb, var(--primary) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--primary) 12%, transparent) 1px, transparent 1px)",
      backgroundSize: "18px 18px",
    },
  },
};

// Уголки — как крестик закрытия, зафиксированы во вьюпорте (не уезжают
// при скролле), с отступом от истинного угла экрана: у смартфонов экран
// скруглён по краям и физически срезает всё, что нарисовано впритык.
const CORNER_STYLES = [
  { top: "max(0.75rem, env(safe-area-inset-top))", left: "max(0.75rem, env(safe-area-inset-left))" },
  { top: "max(0.75rem, env(safe-area-inset-top))", right: "max(0.75rem, env(safe-area-inset-right))" },
  { bottom: "max(0.75rem, env(safe-area-inset-bottom))", right: "max(0.75rem, env(safe-area-inset-right))" },
  { bottom: "max(0.75rem, env(safe-area-inset-bottom))", left: "max(0.75rem, env(safe-area-inset-left))" },
] as const;
const CORNER_ROTATIONS = ["", "rotate-90", "rotate-180", "-rotate-90"] as const;

function FrameCorners({ frame }: { frame: CardFrame }) {
  if (frame !== "scifi" && frame !== "fantasy") return null;
  const isScifi = frame === "scifi";
  return (
    <>
      {CORNER_STYLES.map((style, i) => (
        <span
          key={i}
          style={style}
          className={cn(
            "pointer-events-none fixed z-10",
            isScifi ? cn("size-6 border-t-2 border-l-2 border-primary", CORNER_ROTATIONS[i]) : "size-1.5 rotate-45 bg-amber-300/60",
          )}
        />
      ))}
    </>
  );
}

function SectionHeading({
  icon: Icon,
  children,
  className,
  badgeStyle,
}: {
  icon: IconType;
  children: React.ReactNode;
  className?: string;
  badgeStyle: React.CSSProperties;
}) {
  return (
    <h3 className={cn("flex items-center gap-2 text-xs font-medium tracking-wide uppercase", className)}>
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full" style={badgeStyle}>
        <Icon className="size-3" />
      </span>
      {children}
    </h3>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-2 opacity-40">
      <span className="h-px flex-1 bg-current" />
      <span className="size-1 rotate-45 bg-current" />
      <span className="h-px flex-1 bg-current" />
    </div>
  );
}

function normalizeFrame(value: string): CardFrame {
  return (["none", "fantasy", "noir", "scifi"] as const).includes(value as CardFrame) ? (value as CardFrame) : "none";
}

export function CharacterCard({
  game,
  role,
  goals,
  onClose,
}: {
  game: { story_synopsis: string; common_goal: string; card_frame: string };
  role: Role;
  goals: CardGoal[];
  onClose?: () => void;
}) {
  const frame = normalizeFrame(game.card_frame);
  const theme = CARD_THEME[frame];
  const roleTint = { backgroundColor: `${role.color}26`, color: role.color };
  const neutralTint = { backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)" };
  const primaryTint = { backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" };

  const sections = [
    game.story_synopsis && (
      <div key="story" className={cn("space-y-1", theme.heading)}>
        <SectionHeading icon={BookOpen} badgeStyle={neutralTint}>
          История
        </SectionHeading>
        <p className="whitespace-pre-line text-sm text-muted-foreground">{game.story_synopsis}</p>
      </div>
    ),
    game.common_goal && (
      <div key="goal" className="space-y-1 text-primary">
        <SectionHeading icon={Target} badgeStyle={primaryTint}>
          Общая цель
        </SectionHeading>
        <p className="whitespace-pre-line text-sm text-foreground">{game.common_goal}</p>
      </div>
    ),
    role.description && (
      <div key="description" className={cn("space-y-1", theme.heading)}>
        <SectionHeading icon={UserRound} badgeStyle={roleTint}>
          О персонаже
        </SectionHeading>
        <p className="whitespace-pre-line text-sm text-foreground">{role.description}</p>
      </div>
    ),
    goals.length > 0 && (
      <div key="objectives" className={cn("space-y-2", theme.heading)}>
        <SectionHeading icon={ListChecks} badgeStyle={roleTint}>
          Цели персонажа
        </SectionHeading>
        <div className="space-y-1.5">
          {goals.map((goal, i) => (
            <div key={goal.id} className="flex items-start gap-2.5 rounded-lg bg-muted/60 p-2.5">
              <span
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={roleTint}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{goal.title}</p>
                {goal.description && <p className="text-xs text-muted-foreground">{goal.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  ].filter((s): s is React.ReactElement => Boolean(s));

  return (
    <div className="relative h-full w-full bg-black">
      {/* Карточка на весь экран: тема — не рамка вокруг текста, а фон всего
          диалога. Скроллится этот внутренний слой, а крестик закрытия —
          отдельный fixed-элемент вне скролла, чтобы не убегал при прокрутке. */}
      <div className={cn("relative h-full w-full overflow-y-auto rounded-[1.75rem]", theme.outer)}>
        <div className={cn("relative mx-auto min-h-full w-full max-w-md", theme.surface)}>
          {/* Персонаж должен быть виден сразу при открытии карточки */}
          <div className={cn("relative", frame === "noir" && "[filter:grayscale(0.15)_contrast(1.05)]")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={roleAvatarUrl(role)} alt={role.name} className="aspect-[3/4] w-full object-cover object-top" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_36px_10px_rgba(0,0,0,0.35)]" />
          </div>
          <div className={cn("p-4", theme.caption)}>
            <h2 className={cn("text-2xl font-bold", theme.name)}>{role.name}</h2>
            <span className="mt-1.5 block h-1 w-10 rounded-full" style={{ backgroundColor: role.color }} />
          </div>

          <div
            className="space-y-4 p-4"
            style={{ ...theme.texture, paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
          >
            {sections.map((section, i) => (
              <div key={section.key} className="space-y-4">
                {i > 0 && <SectionDivider />}
                {section}
              </div>
            ))}
          </div>
        </div>
      </div>
      <FrameCorners frame={frame} />
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{ top: "max(0.75rem, env(safe-area-inset-top))", right: "max(0.75rem, env(safe-area-inset-right))" }}
          className={cn(
            "fixed z-30 flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
            theme.close,
          )}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
