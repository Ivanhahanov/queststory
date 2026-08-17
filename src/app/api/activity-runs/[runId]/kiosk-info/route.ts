import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupVoteConfig } from "@/lib/types";

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

  return NextResponse.json({
    status: run.status,
    type: template.type,
    name: template.name,
    instructions: template.instructions,
    options: template.type === "group_vote" ? groupVoteConfig(template.config).options : undefined,
  });
}
