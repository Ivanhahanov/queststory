"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings2, Users, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "constructor", label: "Конфигурация", icon: Settings2 },
  { segment: "distribute", label: "Раздача", icon: Users },
  { segment: "live", label: "Игра", icon: Radio },
] as const;

export function GameNavTabs({ gameId }: { gameId: string }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-popover/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl [padding-bottom:env(safe-area-inset-bottom)]">
        {TABS.map(({ segment, label, icon: Icon }) => {
          const href = `/games/${gameId}/${segment}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={segment}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
