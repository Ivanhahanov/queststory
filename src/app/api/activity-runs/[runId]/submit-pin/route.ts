import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { completeGoalForAllPlayers } from "@/lib/complete-goal";
import { sendPushToPlayers } from "@/lib/push";
import { pinCodeConfig } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: run } = await admin
    .from("activity_runs")
    .select("*, activity_templates(*)")
    .eq("id", runId)
    .single();

  if (!run || run.status !== "active" || run.activity_templates?.type !== "pin_code") {
    return NextResponse.json({ error: "activity not active" }, { status: 404 });
  }

  // Personal-mode submissions are tied to the calling player, if there is a session.
  // Kiosk-mode has no session at all — attempts are recorded anonymously.
  let playerId: string | null = null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("game_id", run.game_id)
      .eq("auth_user_id", user.id)
      .maybeSingle();
    playerId = player?.id ?? null;
  }

  const correct = code === pinCodeConfig(run.activity_templates!.config).correctCode;

  await admin.from("activity_submissions").insert({
    activity_run_id: run.id,
    player_id: playerId,
    payload: { code },
    status: correct ? "correct" : "incorrect",
  });

  if (correct) {
    await admin.from("activity_runs").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", run.id);
    if (run.activity_templates!.linked_goal_id) {
      await completeGoalForAllPlayers(admin, run.game_id, run.activity_templates!.linked_goal_id);
    }
    await admin.from("messages").insert({
      game_id: run.game_id,
      player_id: null,
      sender: "system",
      body: `Код подобран верно: «${run.activity_templates!.name}»`,
    });

    const { data: allPlayers } = await admin.from("players").select("id").eq("game_id", run.game_id);
    await sendPushToPlayers(
      (allPlayers ?? []).map((p) => p.id),
      { title: "Квестория", body: `Код подобран верно: «${run.activity_templates!.name}»` },
    );
  }

  return NextResponse.json({ correct });
}
