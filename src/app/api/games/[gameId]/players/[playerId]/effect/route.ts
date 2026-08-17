import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayers } from "@/lib/push";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ gameId: string; playerId: string }> },
) {
  const { playerId } = await params;
  const body = await req.json().catch(() => null);
  const effectTemplateId = typeof body?.effectTemplateId === "string" ? body.effectTemplateId : null;
  if (!effectTemplateId) return NextResponse.json({ error: "effectTemplateId required" }, { status: 400 });

  const supabase = await createClient();
  const { data: effect, error } = await supabase
    .from("player_effects")
    .insert({
      player_id: playerId,
      effect_template_id: effectTemplateId,
      custom_text: body.customText || null,
      value: body.value ?? null,
      target_goal_id: body.targetGoalId || null,
    })
    .select("*, effect_templates(*)")
    .single();

  if (error || !effect) return NextResponse.json({ error: error?.message ?? "failed" }, { status: 403 });

  await sendPushToPlayers([playerId], {
    title: "Ведущий применил эффект",
    body: effect.effect_templates?.name ?? "Загляните в игру",
  });

  return NextResponse.json({ effect });
}
