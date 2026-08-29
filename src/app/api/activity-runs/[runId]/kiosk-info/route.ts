import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupVoteConfig } from "@/lib/types";
import { buildVoteResults } from "@/lib/vote-results";

export async function GET(_req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const admin = createAdminClient();

  const { data: run } = await admin
    .from("activity_runs")
    .select("*, activity_templates(*)")
    .eq("id", runId)
    .single();

  if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });
  const template = run.activity_templates!;

  const { data: game } = await admin.from("games").select("accent_color").eq("id", run.game_id).single();

  let results;
  if (template.type === "group_vote") {
    const [{ data: submissions }, { data: gamePlayers }] = await Promise.all([
      admin.from("activity_submissions").select("payload, player_id").eq("activity_run_id", runId),
      admin.from("players").select("id, display_name").eq("game_id", run.game_id),
    ]);
    const playerNameById = new Map((gamePlayers ?? []).map((p) => [p.id, p.display_name ?? "Игрок"]));
    results = buildVoteResults(template.results_visibility, submissions ?? [], playerNameById);
  }

  return NextResponse.json({
    gameId: run.game_id,
    status: run.status,
    type: template.type,
    name: template.name,
    instructions: template.instructions,
    options: template.type === "group_vote" ? groupVoteConfig(template.config).options : undefined,
    results,
    accentColor: game?.accent_color ?? "#8b5cf6",
  });
}
