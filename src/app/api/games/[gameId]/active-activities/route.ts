import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupVoteConfig } from "@/lib/types";
import { buildVoteResults } from "@/lib/vote-results";

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

  const voteRuns = (runs ?? []).filter((r) => r.activity_templates?.display_mode === "personal" && r.activity_templates.type === "group_vote");
  let submissionsByRun = new Map<string, { payload: unknown; player_id: string | null }[]>();
  let playerNameById = new Map<string, string>();

  if (voteRuns.length > 0) {
    const [{ data: submissions }, { data: gamePlayers }] = await Promise.all([
      admin
        .from("activity_submissions")
        .select("activity_run_id, payload, player_id")
        .in("activity_run_id", voteRuns.map((r) => r.id)),
      admin.from("players").select("id, display_name").eq("game_id", gameId),
    ]);
    playerNameById = new Map((gamePlayers ?? []).map((p) => [p.id, p.display_name ?? "Игрок"]));
    submissionsByRun = new Map();
    for (const s of submissions ?? []) {
      const list = submissionsByRun.get(s.activity_run_id) ?? [];
      list.push({ payload: s.payload, player_id: s.player_id });
      submissionsByRun.set(s.activity_run_id, list);
    }
  }

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
        results:
          t.type === "group_vote"
            ? buildVoteResults(t.results_visibility, submissionsByRun.get(r.id) ?? [], playerNameById)
            : undefined,
      };
    });

  return NextResponse.json({ activities: personal, playerId: player.id });
}
