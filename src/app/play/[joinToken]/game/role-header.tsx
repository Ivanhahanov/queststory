import { Coins } from "lucide-react";
import { dicebearUrl } from "@/lib/dicebear";
import { parseAvatarOptions } from "@/lib/avatar-options";
import type { Role } from "@/lib/types";

export function RoleHeader({
  role,
  displayName,
  points,
}: {
  role: Role | null;
  displayName: string | null;
  points: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4">
      <div
        className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2"
        style={{ borderColor: role?.color ?? "var(--border)" }}
      >
        {role ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dicebearUrl(role.avatar_style, role.avatar_seed, parseAvatarOptions(role.avatar_options))}
            alt={role.name}
            className="size-full"
          />
        ) : (
          <span className="text-xs text-muted-foreground">Роль скоро будет назначена</span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-xs text-muted-foreground">{displayName}</p>
        <h1 className="truncate text-xl font-semibold">{role?.name ?? "Ожидание роли"}</h1>
        {role?.description && <p className="line-clamp-3 text-sm text-muted-foreground">{role.description}</p>}
        {points !== 0 && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
            <Coins className="size-3.5" /> {points}
          </span>
        )}
      </div>
    </div>
  );
}
