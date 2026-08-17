import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayers } from "@/lib/push";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ gameId: string; playerId: string }> },
) {
  const { gameId, playerId } = await params;
  const body = await req.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "body required" }, { status: 400 });

  const supabase = await createClient();
  const { data: message, error } = await supabase
    .from("messages")
    .insert({ game_id: gameId, player_id: playerId, body: text })
    .select()
    .single();

  if (error || !message) return NextResponse.json({ error: error?.message ?? "failed" }, { status: 403 });

  await sendPushToPlayers([playerId], { title: "Сообщение от ведущего", body: text });

  return NextResponse.json({ message });
}
