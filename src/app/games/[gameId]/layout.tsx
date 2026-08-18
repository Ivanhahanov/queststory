import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { assertFound } from "@/lib/supabase/assert-found";
import { Button } from "@/components/ui/button";
import { gameThemeStyle } from "@/lib/theme-color";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { GameNavTabs } from "./game-nav-tabs";

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const supabase = await createClient();
  const { data: game, error } = await supabase
    .from("games")
    .select("id, title, accent_color")
    .eq("id", gameId)
    .single();

  assertFound(game, error);

  return (
    <div style={gameThemeStyle(game.accent_color)} className="flex min-h-full flex-1 flex-col">
      <ThemeColorSync color={game.accent_color} />
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/games" />}>
            <ArrowLeft />
          </Button>
          <h1 className="truncate text-lg font-semibold">{game.title}</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 pb-28">{children}</main>
      <GameNavTabs gameId={game.id} />
    </div>
  );
}
