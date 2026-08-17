import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupVoteConfig } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: player } = await supabase
    .from("players")
    .select("id, game_id")
    .eq("game_id", gameId)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!player) return NextResponse.json({ error: "not a player of this game" }, { status: 403 });

  const admin = createAdminClient();
  const { data: runs } = await admin
    .from("activity_runs")
    .select("*, activity_templates(*)")
    .eq("game_id", gameId)
    .eq("status", "active");

  const personal = (runs ?? [])
    .filter((r) => r.activity_templates?.display_mode === "personal")
    .map((r) => {
      const t = r.activity_templates!;
      return {
        runId: r.id,
        type: t.type,
        name: t.name,
        instructions: t.instructions,
        options: t.type === "group_vote" ? groupVoteConfig(t.config).options : undefined,
      };
    });

  return NextResponse.json({ activities: personal, playerId: player.id });
}
