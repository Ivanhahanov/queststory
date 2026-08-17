import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const body = await req.json().catch(() => null);
  const choice = typeof body?.choice === "string" ? body.choice : "";
  if (!choice) return NextResponse.json({ error: "choice required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: run } = await admin.from("activity_runs").select("*").eq("id", runId).single();
  if (!run || run.status !== "active") return NextResponse.json({ error: "activity not active" }, { status: 404 });

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

  await admin.from("activity_submissions").insert({
    activity_run_id: run.id,
    player_id: playerId,
    payload: { choice },
    status: "pending",
  });

  return NextResponse.json({ ok: true });
}
