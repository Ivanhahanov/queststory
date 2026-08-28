"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { scenarioSchema } from "@/lib/scenario";
import type { Json } from "@/lib/supabase/types";

export async function createGame(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("games")
    .insert({ title, owner_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Не удалось создать игру");
  }

  redirect(`/games/${data.id}/constructor`);
}

const MAX_SCENARIO_JSON_BYTES = 300_000;

export async function importScenario(jsonText: string): Promise<{ error: string } | void> {
  if (new Blob([jsonText]).size > MAX_SCENARIO_JSON_BYTES) {
    return { error: "Файл слишком большой (лимит 300 КБ) — похоже, в нём лишний текст помимо JSON." };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    return { error: "Это не валидный JSON — проверьте файл или вставленный текст." };
  }

  const parsed = scenarioSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `Не подходит под схему сценария: ${issue.path.join(".") || "root"} — ${issue.message}` };
  }
  const scenario = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      title: scenario.title,
      story_synopsis: scenario.story_synopsis,
      common_goal: scenario.common_goal,
      ...(scenario.accent_color ? { accent_color: scenario.accent_color } : {}),
      owner_id: user.id,
    })
    .select("id")
    .single();
  if (gameError || !game) return { error: gameError?.message ?? "Не удалось создать игру" };
  const gameId = game.id as string;

  const roundRows = scenario.rounds.map((r, position) => ({
    id: randomUUID(),
    game_id: gameId,
    position,
    name: r.name,
    description: r.description,
    planned_duration_seconds: r.planned_duration_seconds,
  }));
  if (roundRows.length) {
    const { error } = await supabase.from("rounds").insert(roundRows);
    if (error) return { error: `Раунды: ${error.message}` };
  }
  const roundIdByName = new Map(roundRows.map((r) => [r.name, r.id]));

  const roleRows = scenario.roles.map((r) => ({
    id: randomUUID(),
    game_id: gameId,
    name: r.name,
    description: r.description,
    avatar_style: r.avatar_style,
    avatar_seed: randomUUID(),
    color: r.color,
  }));
  if (roleRows.length) {
    const { error } = await supabase.from("roles").insert(roleRows);
    if (error) return { error: `Роли: ${error.message}` };
  }

  const goalRows = [
    ...scenario.roles.flatMap((r, roleIdx) =>
      r.goals.map((g, position) => ({
        game_id: gameId,
        role_id: roleRows[roleIdx].id,
        title: g.title,
        description: g.description,
        unlock_round_id: g.unlock_round ? (roundIdByName.get(g.unlock_round) ?? null) : null,
        position,
      })),
    ),
    ...scenario.common_goals.map((g, position) => ({
      game_id: gameId,
      role_id: null,
      title: g.title,
      description: g.description,
      unlock_round_id: g.unlock_round ? (roundIdByName.get(g.unlock_round) ?? null) : null,
      position,
    })),
  ];
  if (goalRows.length) {
    const { error } = await supabase.from("goals").insert(goalRows);
    if (error) return { error: `Цели: ${error.message}` };
  }

  if (scenario.effect_templates.length) {
    const { error } = await supabase.from("effect_templates").insert(
      scenario.effect_templates.map((e) => ({
        game_id: gameId,
        name: e.name,
        type: e.type,
        color: e.color,
        default_text: e.default_text,
      })),
    );
    if (error) return { error: `Эффекты: ${error.message}` };
  }

  if (scenario.activity_templates.length) {
    const { error } = await supabase.from("activity_templates").insert(
      scenario.activity_templates.map((a) => ({
        game_id: gameId,
        type: a.type,
        name: a.name,
        instructions: a.instructions,
        display_mode: a.display_mode,
        config: a.config as Json,
      })),
    );
    if (error) return { error: `Активности: ${error.message}` };
  }

  redirect(`/games/${gameId}/constructor`);
}
