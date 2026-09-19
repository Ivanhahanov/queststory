import { Card, CardContent } from "@/components/ui/card";
import { roleAvatarUrl } from "@/lib/avatar-options";
import { cn } from "@/lib/utils";
import type { EffectTemplate, Goal, Player, PlayerEffect, PlayerGoalProgress, Role } from "@/lib/types";

export function PlayerCard({
  player,
  role,
  goals,
  progress,
  effects,
  effectTemplates,
  online,
  onClick,
}: {
  player: Player;
  role: Role | null;
  goals: Goal[];
  progress: PlayerGoalProgress[];
  effects: PlayerEffect[];
  effectTemplates: EffectTemplate[];
  online: boolean;
  onClick: () => void;
}) {
  const applicableGoals = goals.filter((g) => g.role_id === null || g.role_id === player.role_id);
  const completedCount = applicableGoals.filter((g) =>
    progress.some((p) => p.goal_id === g.id && p.player_id === player.id && p.completed),
  ).length;

  const labelEffects = effects
    .map((e) => ({ e, template: effectTemplates.find((t) => t.id === e.effect_template_id) }))
    .filter((x) => x.template?.type === "status_label")
    .sort((a, b) => +new Date(b.e.applied_at) - +new Date(a.e.applied_at));
  const latest = labelEffects[0];
  const latestLabel = latest && (latest.e.custom_text || latest.template?.default_text || latest.template?.name);

  return (
    <Card className="cursor-pointer gap-2 py-3 transition-colors hover:border-primary/50" onClick={onClick}>
      <CardContent className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="relative flex size-12 items-center justify-center overflow-hidden rounded-xl border-2 bg-muted transition-colors"
            style={{ borderColor: latest?.template?.color ?? role?.color ?? "var(--border)" }}
          >
            {role ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={roleAvatarUrl(role)} alt={role.name} className="size-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">?</span>
            )}
            {latestLabel && (
              <div
                className="absolute inset-x-0 bottom-0 truncate px-0.5 text-center text-[7px] leading-tight font-semibold text-white"
                style={{ backgroundColor: `${latest.template?.color}d9` }}
              >
                {latestLabel}
              </div>
            )}
            {labelEffects.length > 1 && (
              <span className="absolute top-0.5 right-0.5 flex size-3.5 items-center justify-center rounded-full bg-black/70 text-[7px] font-bold text-white">
                +{labelEffects.length - 1}
              </span>
            )}
          </div>
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-card",
              online ? "bg-emerald-500" : "bg-muted-foreground/50",
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium">{player.display_name ?? "Ждём игрока"}</p>
            {applicableGoals.length > 0 && (
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {completedCount}/{applicableGoals.length}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{role?.name ?? "Роль не назначена"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
