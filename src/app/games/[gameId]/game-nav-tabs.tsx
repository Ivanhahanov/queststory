"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings2, Users, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "constructor", label: "Настройки", icon: Settings2 },
  { segment: "distribute", label: "Раздача", icon: Users },
  { segment: "live", label: "Игра", icon: Radio },
] as const;

export function GameNavTabs({ gameId }: { gameId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-xl bg-muted p-1">
      {TABS.map(({ segment, label, icon: Icon }) => {
        const href = `/games/${gameId}/${segment}`;
        const active = pathname.startsWith(href);
        return (
          <Link
            key={segment}
            href={href}
            className={cn(
              "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
